const { BOARD_WIDTH, BOARD_HEIGHT } = require('./config');

class Board {
  constructor() {
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    return new Array(BOARD_WIDTH).map(() => Array(BOARD_HEIGHT).fill(0));
  }
}

module.exports = Board;