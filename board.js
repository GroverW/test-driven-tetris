const { BOARD_WIDTH, BOARD_HEIGHT } = require('./data');

class Board {
  constructor() {
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    return new Array(BOARD_WIDTH).map(() => Array(BOARD_HEIGHT).fill(0));
  }

  rotatePiece(piece, direction) {
    let newGrid = JSON.parse(JSON.stringify(piece.grid));

    for(let i = 0; i < newGrid.length; i++) {
      for(let j = 0; j < i; j++) {
        [newGrid[j][i], newGrid[i][j]] = [newGrid[i][j], newGrid[j][i]];
      }
    }

    direction > 0
      ? newGrid.forEach(row => row.reverse())
      : newGrid.reverse();

    piece.update(newGrid);
  }
}

module.exports = Board;