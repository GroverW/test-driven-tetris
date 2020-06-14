const { PIECES, BOARD_WIDTH } = require('common/helpers/constants');

/**
 * Represents a list of game pieces by id
 */
class PieceList {
  /**
   * @constructor
   */
  constructor() {
    this.pieces = [];
    this.currIdx = 0;
    this.currSet = 0;
  }

  /**
   * Adds a new set of pieces to the piece list
   * @param {array} pieces - array of piece Ids
   */
  addSet(pieces) {
    this.pieces.push(pieces);
  }

  /**
   * Gets the next piece id
   * @returns {number} - the id of the next piece
   */
  getNextPiece() {
    const currentPiece = this.pieces[this.currSet][this.currIdx];
    this.currIdx += 1;
    
    if(this.currIdx >= this.pieces[this.currSet].length) {
      this.currIdx = 0;
      this.currSet += 1;
    }
    
    return currentPiece;
  }

  /**
   * Checks whether we've close to the end of the current piece list
   * @returns {boolean} - if we're <= 15 pieces from the end of the list
   */
  almostEmpty() {
    return (
      this.currSet === this.pieces.length - 1 && 
      this.pieces[0].length - this.currIdx <= 15
    );
  }
}


/**
 * Represents a game piece.
 */
class Piece {
  /**
   * @constructor
   * @param {number} piece - id of piece
   */
  constructor(piece) {
    this.type = piece;
    this.piece = PIECES[piece];
    this.rotation = 0;
    this.grid = this.piece[this.rotation];
    this.x = Math.floor(BOARD_WIDTH / 2) - Math.ceil(this.grid[0].length / 2);
    this.y = 0;
  }

  /**
   * Updates the x and y coordinatese of the piece
   * @param {number} x - change in x-coordinate
   * @param {number} y - change in y-coordinate
   */
  move(x,y) {
    this.x += x;
    this.y += y;
  }

  /**
   * Updates the piece's grid based on clockwise or counter-clockwise rotation
   * @param {number} rotation - (-1) for counter-clockwise, (1) for clockwise
   */
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