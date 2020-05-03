const { PIECES, SEED_PIECES, BOARD_WIDTH } = require('../helpers/data');
const { randomize } = require('../helpers/utils');

class PieceList {
  constructor() {
    this.pieces = [];
    this.currIdx = 0;
    this.currSet = 0;
  }

  addSet(pieces) {
    this.pieces.push(pieces);
  }

  getNextPiece() {
    const currentPiece = PIECES[this.pieces[this.currSet][this.currIdx]];
    this.currIdx++;
    
    if(this.currIdx >= this.pieces[currSet].length) {
      this.currIdx = 0;
      this.currSet++;
    }
    
    return JSON.parse(JSON.stringify(currentPiece));
  }

  almostEmpty() {
    return (
      this.currSet === this.pieces.length && 
      this.pieces[0].length - this.currIdx <= 15
    );
  }
}

class Piece {
  constructor(piece) {
    this.grid = piece;
    this.x = Math.floor(BOARD_WIDTH / 2) - Math.ceil(this.grid[0].length / 2);
    this.y = 0;
  }

  move(x,y) {
    this.x += x;
    this.y += y;
  }

  update(newGrid) {
    this.grid = newGrid;
  }
}

module.exports = {
  PieceList,
  Piece
};