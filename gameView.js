const { subscribe } = require('./pubSub');
const { CELL_COLORS } = require('./data');

class GameView {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.strokeStyle = "black";
    this.unsubDraw = subscribe('drawAll', this.drawBoard.bind(this));
  }

  drawBoard(board) {
    board.grid.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      this.ctx.fillStyle = CELL_COLORS[cell];
      this.ctx.rect(colIdx, rowIdx, 1, 1);
    }))
  }
}

module.exports = GameView;