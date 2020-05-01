const { subscribe } = require('./pubSub');
const { CELL_COLORS } = require('./data');

class GameView {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.strokeStyle = "black";
    this.unsubDraw = subscribe('drawAll', this.drawAll.bind(this));
  }

  drawAll(data) {
    this.drawElement(data.piece);
    this.drawElement(data.board);
  }

  drawElement(element) {
    element.grid.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      this.ctx.fillStyle = CELL_COLORS[cell];
      this.ctx.rect(colIdx, rowIdx, 1, 1);
    }))
  }
}

module.exports = GameView;