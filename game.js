const Board = require('./board');
const { CONTROLS } = require('./data');

class Game {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.board = new Board();
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
}

module.exports = Game;