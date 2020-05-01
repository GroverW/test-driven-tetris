const { subscribe } = require('./pubSub');
const { CELL_COLORS } = require('./data');

class GameView {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.strokeStyle = "black";
    this.unsubDraw = subscribe('drawAll', this.drawBoard.bind(this));
  }

  drawBoard(board) {
    board.grid.forEach(row => row.forEach(cell => {
      this.ctx.fillStyle = CELL_COLORS[cell];

    }))
  }
}

module.exports = GameView;