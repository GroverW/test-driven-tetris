const { subscribe } = require('../../pubSub');
const { CELL_COLORS, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } = require('./data');
const { getNewPlayer } = require('../../helpers/utils');

class GameView {
  constructor(ctx, ctxNext) {
    this.ctx = this.initCtx(ctx, CELL_SIZE);
    this.ctxNext = this.initCtx(ctxNext, CELL_SIZE, 4, 4);
    this.unsubDraw = subscribe('draw', this.draw.bind(this));
    this.players = [];
  }

  initCtx(ctx, cellSize, width=BOARD_WIDTH, height=BOARD_HEIGHT) {
    this.scaleBoardSize(ctx, cellSize, width, height);
    ctx.strokeStyle = "black";
    
    return ctx;
  }

  draw(data) {
    data.piece && this.drawPiece(this.ctx, data.piece, data.piece.x, data.piece.y);
    data.board && this.drawBoard(this.ctx, data.board);
    data.nextPiece && this.drawPiece(this.ctxNext, data.nextPiece, 0, 0);
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

  scaleBoardSize(ctx, cellSize, width=BOARD_WIDTH, height=BOARD_HEIGHT) {
    ctx.canvas.width = width * cellSize;
    ctx.canvas.height = height * cellSize;
    ctx.scale(cellSize, cellSize)
  }

  addPlayer(playerCtx, board, id) {
    let cellSize = CELL_SIZE;

    if(this.players.length === 1) {
      cellSize /= 2;
      this.scaleBoardSize(this.players[0].ctx, cellSize);
      this.drawBoard(this.players[0].ctx, this.players[0].board);
    }

    const newCtx = this.initCtx(playerCtx, cellSize);

    this.players.push(getNewPlayer(newCtx, board, id))
    this.drawBoard(newCtx, board);
  }

  removePlayer(id) {
    const playerIdx = this.players.findIndex(p => p.id === id);
    (playerIdx >= 0) && this.players.splice(playerIdx, 1);

    if(this.players.length === 1) {
      this.scaleBoardSize(this.players[0].ctx, CELL_SIZE);
      this.drawBoard(this.players[0].ctx, this.players[0].board);
    }
  }
}

module.exports = GameView;