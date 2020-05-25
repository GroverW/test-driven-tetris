const { PIECES, BOARD_WIDTH } = require('../helpers/data');

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
    const currentPiece = this.pieces[this.currSet][this.currIdx];
    this.currIdx++;
    
    if(this.currIdx >= this.pieces[this.currSet].length) {
      this.currIdx = 0;
      this.currSet++;
    }
    
    return currentPiece;
  }

  almostEmpty() {
    return (
      this.currSet === this.pieces.length - 1 && 
      this.pieces[0].length - this.currIdx <= 15
    );
  }
}

class Piece {
  constructor(piece) {
    this.type = piece;
    this.piece = PIECES[piece];
    this.rotation = 0;
    this.grid = this.piece[this.rotation];
    this.x = Math.floor(BOARD_WIDTH / 2) - Math.ceil(this.grid[0].length / 2);
    this.y = 0;
  }

  move(x,y) {
    this.x += x;
    this.y += y;
  }

  update(rotation) {
    const rotAmt = this.rotation + rotation;
    
    this.rotation = rotAmt < 0 ? 3 : rotAmt % 4;

    this.grid = this.piece[this.rotation];
  }
}

module.exports = {
  PieceList,
  Piece
};