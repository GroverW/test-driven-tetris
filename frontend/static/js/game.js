const Board = require('./board');
const { 
  CONTROLS,
  COMMAND_QUEUE_MAP,
  POINTS,
  LINES_PER_LEVEL,
  ANIMATION_SPEED,
  MAX_SPEED 
} = require('../../helpers/data');
const { publish, subscribe } = require('../../helpers/pubSub');

class Game {
  constructor(id) {
    this.gameStatus = false;
    this.id = id;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.board = new Board(id);
    this.time = { start: 0, elapsed: 0 }
    this.animationId;
    this.commandQueue = [];
    this.subscriptions = [
      subscribe('lowerPiece', this.updateScore.bind(this)),
      subscribe('clearLines', this.clearLines.bind(this)),
      subscribe('gameOver', this.gameOver.bind(this)),
      subscribe('boardChange', this.sendCommandQueue.bind(this)),
    ];
  }

  start() {
    if(this.gameStatus) return;
    this.board.getPieces();
    this.gameStatus = true;
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
      [CONTROLS.LEFT]: () => this.board.movePiece(-1,0),
      [CONTROLS.RIGHT]: () => this.board.movePiece(1,0),
      [CONTROLS.DOWN]: () =>  this.board.movePiece(0,1),
      [CONTROLS.AUTO_DOWN]: () =>  this.board.movePiece(0,1,0),
      [CONTROLS.ROTATE_LEFT]: () => this.board.rotatePiece(this.board.piece, -1),
      [CONTROLS.ROTATE_RIGHT]: () => this.board.rotatePiece(this.board.piece, 1),
      [CONTROLS.HARD_DROP]: () => this.board.hardDrop(),
    }

    if((key in commands) && this.gameStatus) {
      this.addToCommandQueue(key);
      commands[key]();
    }

    if(!this.gameStatus && this.commandQueue.length > 0) {
      this.sendCommandQueue();
    }
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

    publish('updateScore', {
      score: this.score
    })
  }

  updateLines(lines) {
    this.lines += lines;

    if(this.linesRemaining <= lines) this.level++

    this.linesRemaining = LINES_PER_LEVEL - this.lines % LINES_PER_LEVEL;

    publish('updateScore', {
      level: this.level,
      lines: this.lines
    })
  }

  clearLines(lines) {
    if(POINTS.LINES_CLEARED[lines]) {
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
    if(id === this.id) {
      this.unsubscribe();
      this.gameStatus = false;
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
    
    if(this.time.elapsed > this.getAnimationDelay()) {
      this.time.start = currTime;
      this.command(CONTROLS.AUTO_DOWN);
    }
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }
}

module.exports = Game;