const { subscribe } = require('../../helpers/pubSub');
const { CELL_COLORS, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } = require('../../helpers/data');

class GameView {
  constructor(ctx, ctxNext) {
    this.ctx = this.initCtx(ctx, CELL_SIZE);
    this.ctxNext = this.initCtx(ctxNext, CELL_SIZE, 4, 4);
    this.unsubDraw = subscribe('draw', this.draw.bind(this));
    // this.unsubAddP = subscribe('addPlayer', this.addPlayer.bind(this));
    this.unsubRemoveP = subscribe('removePlayer', this.removePlayer.bind(this));
    this.unsubUpdateP = subscribe('updatePlayerBoard', this.updatePlayer.bind(this));
    this.players = [];
  }

  initCtx(ctx, cellSize, width=BOARD_WIDTH, height=BOARD_HEIGHT) {
    this.scaleBoardSize(ctx, cellSize, width, height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3 / cellSize;
    
    return ctx;
  }

  draw(data) {
    data.board && this.drawBoard(this.ctx, data.board);
    data.piece && this.drawPiece(this.ctx, data.piece, data.piece.x, data.piece.y);
    data.nextPiece && this.drawNext(this.ctxNext, data.nextPiece);
  }

  drawBoard(ctx, board) {
    board.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      ctx.strokeRect(colIdx, rowIdx, 1, 1);
      ctx.fillStyle = CELL_COLORS[cell];
      ctx.fillRect(colIdx, rowIdx, 1, 1);
    }))
  }

  drawPiece(ctx, piece, xStart, yStart) {
    piece.grid.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      if(cell > 0) {
        ctx.strokeRect(xStart + colIdx, yStart + rowIdx, 1, 1);
        ctx.fillStyle = CELL_COLORS[cell];
        ctx.fillRect(xStart + colIdx, yStart + rowIdx, 1, 1);
      }
    }))
  }

  drawNext(ctx, piece) {
    ctx.clearRect(0, 0, 4, 4);
    this.drawPiece(ctx, piece, 0, 0)
  }

  scaleBoardSize(ctx, cellSize, width=BOARD_WIDTH, height=BOARD_HEIGHT) {
    ctx.canvas.width = width * cellSize;
    ctx.canvas.height = height * cellSize;
    ctx.lineWidth = 3 / cellSize;
    ctx.scale(cellSize, cellSize)
  }

  addPlayer(player) {
    let cellSize = CELL_SIZE;

    if(this.players.length >= 1) {
      cellSize /= 2;
      this.scaleBoardSize(this.players[0].ctx, cellSize);
      this.drawBoard(this.players[0].ctx, this.players[0].board);
    }

    this.players.push(player)

    this.initCtx(player.ctx, cellSize);
    this.drawBoard(player.ctx, player.board);
  }

  removePlayer(id) {
    const playerIdx = this.players.findIndex(p => p.id === id);
    (playerIdx >= 0) && this.players.splice(playerIdx, 1);

    if(this.players.length === 1) {
      this.scaleBoardSize(this.players[0].ctx, CELL_SIZE);
      this.drawBoard(this.players[0].ctx, this.players[0].board);
    }
  }

  updatePlayer(player) {
    const playerIdx = this.players.findIndex(p => p.id === player.id);

    if(playerIdx >= 0) {
      const selectedPlayer = this.players[playerIdx];
      
      selectedPlayer.board = player.board;
      this.drawBoard(selectedPlayer.ctx, selectedPlayer.board);
    }
  }
}

module.exports = GameView;