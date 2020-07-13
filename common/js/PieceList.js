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
   * @param {number[]} pieces - array of piece ids
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

    if (this.currIdx >= this.pieces[this.currSet].length) {
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
      this.currSet === this.pieces.length - 1
      && this.pieces[0].length - this.currIdx <= 15
    );
  }
}

module.exports = PieceList;
