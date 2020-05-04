const Board = require('./board');
const { POINTS, LINES_PER_LEVEL } = require('../helpers/data');

class Game {
  constructor(pubSub, playerId) {
    this.playerId = playerId;
    this.gameStatus = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.pubSub = pubSub;
    this.board = new Board(this.pubSub, this.playerId);
    this.unsubDrop = this.pubSub.subscribe('lowerPiece', this.updateScore.bind(this));
    this.unsubClear = this.pubSub.subscribe('clearLines', this.clearLines.bind(this));
    this.unsubGame = this.pubSub.subscribe('gameOver', this.gameOver.bind(this));
  }

  start() {
    this.board.getPieces();
    this.gameStatus = true;
  }

  command(action) {
    const commands = {
      LEFT: () => this.board.movePiece(-1,0),
      RIGHT: () => this.board.movePiece(1,0),
      DOWN: () =>  this.board.movePiece(0,1),
      AUTO_DOWN: () => this.board.movePiece(0,1,0),
      ROTATE_LEFT: () => this.board.rotatePiece(this.board.piece, -1),
      ROTATE_RIGHT: () => this.board.rotatePiece(this.board.piece, 1),
      HARD_DROP: () => this.board.hardDrop(),
    }

    if((action in commands) && this.gameStatus) commands[action]();
  }

  executeCommandQueue(commands) {
    commands.forEach(action => this.command(action));
  }

  updateScore(points) {
    this.score += points;
  }

  updateLines(lines) {
    this.lines += lines;

    if(this.linesRemaining <= lines) this.level++

    this.linesRemaining = LINES_PER_LEVEL - this.lines % LINES_PER_LEVEL;
  }

  clearLines(lines) {
    if(POINTS.LINES_CLEARED[lines]) {
      this.updateScore(POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLines(lines);
    }
  }

  gameOver() {
    this.unsubDrop();
    this.unsubClear();
    this.unsubGame();
    this.gameStatus = false;
  }
}

module.exports = Game;