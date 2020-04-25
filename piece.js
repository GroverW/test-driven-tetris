const { PIECES, SEED_PIECES } = require('./data');
const { randomize } = require('./helpers/utils');

class Pieces {
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

class Piece extends Pieces {
  constructor() {
    super();
    this.piece = this.getNextPiece();
    this.x = 0;
    this.y = 0;
  }
}

module.exports = Piece;