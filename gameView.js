const { subscribe } = require('./pubSub');
const { CELL_COLORS } = require('./data');

class GameView {
  constructor(ctx, ctxNext) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.ctx.strokeStyle = "black";
    this.unsubDraw = subscribe('draw', this.draw.bind(this));
  }

  draw(data) {
    if(data.piece) this.drawPiece(this.ctx, data.piece, data.piece.x, data.piece.y);
    if(data.board) this.drawBoard(this.ctx, data.board);
    if(data.nextPiece) this.drawPiece(this.ctxNext, data.nextPiece, 0, 0);
  }

  drawBoard(ctx, board) {
    board.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      ctx.fillStyle = CELL_COLORS[cell];
      ctx.rect(colIdx, rowIdx, 1, 1);
    }))
  }

  drawPiece(ctx, piece, xStart, yStart) {
    piece.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      if(cell > 0) {
        ctx.fillStyle = CELL_COLORS[cell];
        ctx.rect(xStart + colIdx, yStart + rowIdx, 1, 1);
      }
    }))
  }
}

module.exports = GameView;