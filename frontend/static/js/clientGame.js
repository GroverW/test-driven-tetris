const Game = require('common/js/game');
const ClientBoard = require('./clientBoard');
const {
  CONTROLS,
  COMMAND_QUEUE_MAP,
  MOVE_SPEED,
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('frontend/helpers/clientConstants');
const { publish, subscribe } = require('frontend/helpers/pubSub');

class ClientGame extends Game {
  constructor(playerId) {
    super(playerId, { publish, subscribe }, ClientBoard);
    this.time = { start: 0, elapsed: 0 };
    this.animationId;
    this.toggledKey = false;
    this.moveTime = { start: 0, elapsed: 0 };
    this.moveDelayIdx = 0;
    this.lockDelay = 0;
    this.interruptAutoDown = false;
    this.commandQueue = [];
    this.subscriptions.push(
      subscribe('boardChange', this.sendCommandQueue.bind(this))
    );
  }

  start() {
    if(super.start()) {
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
      const INCREMENT = this.getLockDelayIncrement();
      this.lockDelay = Math.min(INCREMENT * 4, this.lockDelay + INCREMENT);
    }
  }

  getLockDelayIncrement() {
    const BASE_DELAY = ANIMATION_SPEED[1];
    const CURRENT_DELAY = this.getAnimationDelay();
    // max is BASE_DELAY / 4, min is BASE_DELAY / 8
    return ((BASE_DELAY / CURRENT_DELAY - 1) / 2 + 1) * CURRENT_DELAY / 4
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

  updateScore(points) {
    super.updateScore(points);

    publish('updateScore', {
      score: this.score,
    })
  }

  updateLines(lines) {
    super.updateLines(lines);

    publish('updateScore', {
      level: this.level,
      lines: this.lines
    })
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
    if (id === this.playerId) {
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
    const validNextMove = this.board.validMove(0,1);

    if(this.interruptAutoDown && validNextMove) {
      this.time.start = currTime;
      this.interruptAutoDown = false;
    }

    if (this.time.elapsed > this.getAutoDropDelay(validNextMove)) {
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

  getAutoDropDelay(validNextMove) {
    const lockDelay = validNextMove ? 0 : this.lockDelay;
    return this.getAnimationDelay() + lockDelay;
  }

  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }
}

module.exports = ClientGame;