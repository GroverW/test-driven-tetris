const { PIECES, SEED_PIECES, BOARD_WIDTH } = require('./data');
const { randomize } = require('./helpers/utils');

class PieceList {
  constructor() {
    this.pieces;
    this.currIdx;
    this.reset();
  }

  reset() {
    this.pieces = randomize(SEED_PIECES);
    this.currIdx = 0;
  }

  getNextPiece() {
    const currentPiece = PIECES[this.pieces[this.currIdx]];
    this.currIdx++;
    
    if(this.currIdx >= this.pieces.length) this.reset();
    
    return JSON.parse(JSON.stringify(currentPiece));
  }
}

const pieceList = new PieceList();

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
  pieceList,
  Piece
};