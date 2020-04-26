const { BOARD_WIDTH, BOARD_HEIGHT } = require('./data');
const { pieceList, Piece } = require('./piece');

class Board {
  constructor() {
    this.grid = this.createEmptyGrid();
    this.piece;
    this.nextPiece;
  }

  createEmptyGrid() {
    return new Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }

  getPieces() {
    this.piece = this.nextPiece
      ? this.nextPiece
      : new Piece(pieceList.getNextPiece());

    this.nextPiece = new Piece(pieceList.getNextPiece());
  }

  movePiece(x, y) {
    if (this.validMove(x, y)) {
      this.piece.move(x, y);
      return true;
    }

    if(y > 0) this.drop()

    return false;
  }

  drop() {
    this.addPieceToBoard();
    this.clearLines();
    this.getPieces();
  }

  hardDrop() {
    while (this.movePiece(0, 1)) continue;
  }

  validMove(xChange, yChange) {
    const xStart = this.piece.x + xChange;
    const yStart = this.piece.y + yChange;
    return this.piece.grid.every((row, yDiff) =>
      row.every((cell, xDiff) =>
        (cell === 0
          || (this.isInBounds(xStart + xDiff, yStart + yDiff)
            && this.isEmpty(xStart + xDiff, yStart + yDiff))
        )
      )
    )
  }

  isEmpty(x, y) {
    return this.grid[y][x] === 0;
  }

  isInBounds(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT;
  }

  rotatePiece(piece, direction) {
    let newGrid = JSON.parse(JSON.stringify(piece.grid));

    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < i; j++) {
        [newGrid[j][i], newGrid[i][j]] = [newGrid[i][j], newGrid[j][i]];
      }
    }

    direction > 0
      ? newGrid.forEach(row => row.reverse())
      : newGrid.reverse();

    piece.update(newGrid);
  }

  addPieceToBoard() {
    const xStart = this.piece.x;
    const yStart = this.piece.y;
    this.piece.grid.forEach((row, yDiff) => {
      row.forEach((cell, xDiff) => {
        if (cell > 0) this.grid[yStart + yDiff][xStart + xDiff] = cell;
      })
    });
  }

  clearLines() {
    this.grid.forEach((row, rowInd) => {
      if(row.every(cell => cell > 0)) {
        this.grid.splice(rowInd, 1);
        this.grid.unshift(Array(BOARD_WIDTH).fill(0));
      }
    })
  }
}

module.exports = Board;