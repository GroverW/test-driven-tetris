const Board = require('./board');
const { CONTROLS, POINTS, LINES_PER_LEVEL } = require('./data');
const { publish, subscribe } = require('./pubSub');

class Game {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.board = new Board();
    this.unsubDrop = subscribe('lowerPiece', this.updateScore.bind(this));
    this.unsubClear = subscribe('clearLines', this.clearLines.bind(this));
    this.unsubGame = subscribe('gameOver', this.gameOver.bind(this));
  }

  start() {
    this.board.getPieces();
    publish('draw', {
      board: this.board.grid,
      piece: this.board.piece.grid,
      nextPiece: this.board.nextPiece.grid
    });
  }

  command(key) {
    const commands = {
      [CONTROLS.LEFT]: () => this.board.movePiece(-1,0),
      [CONTROLS.RIGHT]: () => this.board.movePiece(1,0),
      [CONTROLS.DOWN]: (multiplier=1) => this.board.movePiece(0,1, multiplier),
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
  }
}

module.exports = Game;