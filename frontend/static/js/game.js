const Board = require('./board');
const {
  CONTROLS,
  COMMAND_QUEUE_MAP,
  POINTS,
  LINES_PER_LEVEL,
  MOVE_SPEED,
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('../../helpers/data');
const { publish, subscribe } = require('../../helpers/pubSub');

class Game {
  constructor(id) {
    this.id = id;
    this.gameStatus = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    // to be passed in
    this.board = new Board(id);
    // from her to command queue is client only
    this.time = { start: 0, elapsed: 0 };
    this.animationId;
    this.toggledKey = false;
    this.moveTime = { start: 0, elapsed: 0 };
    this.moveDelayIdx = 0;
    this.lockDelay = 0;
    this.interruptAutoDown = false;
    this.commandQueue = [];
    // to be set
    this.subscriptions = [
      subscribe('lowerPiece', this.updateScore.bind(this)),
      subscribe('clearLines', this.clearLines.bind(this)),
      subscribe('gameOver', this.gameOver.bind(this)),
      subscribe('boardChange', this.sendCommandQueue.bind(this)),
    ];
  }

  start() {
    if (this.gameStatus || this.gameStatus === null) return;
    this.board.getPieces();
    this.gameStatus = true;
    // client only from here down
    this.animate();

    publish('draw', {
      board: this.board.grid,
      piece: this.board.piece,
      nextPiece: this.board.nextPiece,
    });

    publish('updateScore', {
      score: this.score,
      level: this.level,
      lines: this.lines
    });
  }

  command(key) {
    const commands = {
      [CONTROLS.LEFT]: () => this.board.movePiece(-1, 0),
      [CONTROLS.RIGHT]: () => this.board.movePiece(1, 0),
      [CONTROLS.DOWN]: () => this.board.movePiece(0, 1),
      [CONTROLS.AUTO_DOWN]: () => this.board.movePiece(0, 1, 0),
      [CONTROLS.ROTATE_LEFT]: () => this.board.rotatePiece(-1),
      [CONTROLS.ROTATE_RIGHT]: () => this.board.rotatePiece(1),
      [CONTROLS.HARD_DROP]: () => this.board.hardDrop(),
    }

    this.addLockDelay(key);
    this.resetAutoDown(key);

    if ((key in commands) && this.gameStatus) {
      this.addToCommandQueue(key);
      commands[key]();
    }

    if (!this.gameStatus && this.commandQueue.length > 0) {
      this.sendCommandQueue();
    }
  }

  toggleMove(key, upDown) {
    const toggleCommands = new Set([
      CONTROLS.LEFT,
      CONTROLS.RIGHT,
      CONTROLS.DOWN,
    ]);

    if (!toggleCommands.has(key) && upDown === 'down')    this.command(key);
    else if (upDown === 'down')                           this.toggledKey = key;
    else if (this.toggledKey === key && upDown === 'up')  this.toggledKey = false;
  }

  addLockDelay(key) {
    const validKeys = new Set([
      CONTROLS.LEFT,
      CONTROLS.RIGHT,
      CONTROLS.ROTATE_LEFT,
      CONTROLS.ROTATE_RIGHT,
    ])

    if(validKeys.has(key)) {
      let animationDelay = this.getAnimationDelay();
      this.lockDelay += this.lockDelay ? animationDelay / 4 : animationDelay / 2;
      this.lockDelay = Math.min(animationDelay * 2, this.lockDelay);
    }
  }

  resetAutoDown(key) {
    if(key === CONTROLS.DOWN) this.interruptAutoDown = true;
  }

  /**
   * COMMAND QUEUE
   * 
   * addToCommandQueue
   * - adds commands to the queue
   * 
   * sendCommandQueue
   * - on boardChange, sends commandQueue to backend
   * 
   */
  addToCommandQueue(action) {
    if (action in COMMAND_QUEUE_MAP) {
      this.commandQueue.push(COMMAND_QUEUE_MAP[action]);
    }
  }


  sendCommandQueue() {
    publish('sendMessage', {
      type: 'executeCommands',
      data: this.commandQueue
    });
    this.commandQueue = [];
  }

  /**
   * SCOREBOARD
   * 
   * updateScore
   * - adds points to score, publishes score
   * 
   * updateLines
   * - updates level
   * - adds lines lines to lines cleared
   * - publishes lines and level
   * 
   * clearLines
   * - calls updateScore and updateLines when clearLines is published
   */
  updateScore(points) {
    this.score += points;

    // client only
    publish('updateScore', {
      score: this.score
    })
  }

  updateLines(lines) {
    this.lines += lines;

    if (this.linesRemaining <= lines) this.level++

    this.linesRemaining = LINES_PER_LEVEL - this.lines % LINES_PER_LEVEL;

    // client only
    publish('updateScore', {
      level: this.level,
      lines: this.lines
    })
  }

  clearLines(lines) {
    if (POINTS.LINES_CLEARED[lines]) {
      this.updateScore(POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLines(lines);
    }
  }

  /**
   * gameOver
   * - called when gameOver is published
   * - unsubscribes from all subs
   * - changes game status
   * - cancels animation
   * - resets animationId
   */
  gameOver({ id }) {
    if (id === this.id) {
      this.unsubscribe();
      this.gameStatus = null;
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
  }

  /**
   * ANIMATION
   * 
   * animate
   * - animates the current piece on the board
   * 
   * getAnimationDelay
   * - determines how quickly piece should move
   */
  animate(currTime = 0) {
    this.time.elapsed = currTime - this.time.start;
    this.moveTime.elapsed = currTime - this.moveTime.start;

    if(this.interruptAutoDown) {
      this.time.start = currTime;
      this.interruptAutoDown = false;
    }

    if (this.time.elapsed > this.getAutoDropDelay()) {
      this.time.start = currTime;
      this.command(CONTROLS.AUTO_DOWN);
      this.lockDelay = 0;
    }

    if (this.toggledKey) {
      if(this.moveTime.elapsed > MOVE_SPEED[this.moveDelayIdx]) {
        this.moveTime.start = currTime;
        this.command(this.toggledKey);
        this.moveDelayIdx = Math.min(this.moveDelayIdx + 1, MOVE_SPEED.length - 1);
      }
    } else {
      this.moveDelayIdx = 0;
    }

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  getAutoDropDelay() {
    const lockDelay = this.board.validMove(0,1) ? 0 : this.lockDelay;
    return this.getAnimationDelay() + lockDelay;
  }

  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }
}

module.exports = Game;