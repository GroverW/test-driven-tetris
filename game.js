const Board = require('./board');
const { CONTROLS, POINTS } = require('./data');
const { subscribe } = require('./pubSub');

class Game {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.board = new Board();
    this.unsubDrop = subscribe('dropPiece', this.updateScore.bind(this))
    this.unsubClear = subscribe('clearLines', this.clearLines.bind(this))
  }

  start() {
    this.board.getPieces();
  }

  command(key) {
    const commands = {
      [CONTROLS.LEFT]: () => this.board.movePiece(-1,0),
      [CONTROLS.RIGHT]: () => this.board.movePiece(1,0),
      [CONTROLS.DOWN]: () => this.board.movePiece(0,1),
      [CONTROLS.ROTATE_LEFT]: () => this.board.rotatePiece(this.board.piece, -1),
      [CONTROLS.ROTATE_RIGHT]: () => this.board.rotatePiece(this.board.piece, 1),
      [CONTROLS.HARD_DROP]: () => this.board.hardDrop(),
    }

    if(key in commands) commands[key]();
  }

  updateScore(points) {
    this.score += points;
  }

  updateLines(lines) {
    this.lines += lines;

    if(this.linesRemaining <= lines) this.level++

    this.linesRemaining = 10 - this.lines % 10;
  }

  clearLines(lines) {
    if(POINTS.LINES_CLEARED[lines]) {
      this.updateScore(POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLines(lines);
    }
  }
}

module.exports = Game;