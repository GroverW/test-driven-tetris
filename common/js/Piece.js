const { PIECES, BOARD_WIDTH } = require('common/helpers/constants');

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
    this.maxY = 0;
  }

  /**
   * Updates the x and y coordinatese of the piece
   * @param {number} x - change in x-coordinate
   * @param {number} y - change in y-coordinate
   */
  move(x, y) {
    this.x += x;
    this.y += y;
    this.maxY = Math.max(this.maxY, this.y);
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

module.exports = Piece;
