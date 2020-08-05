const Board = require('common/js/Board');
const { GET_PIECES } = require('backend/topics');

/**
 * Represents a server-side game board
 */
class ServerBoard extends Board {
  /**
   * Sets the current and next pieces
   */
  getPieces() {
    super.getPieces();

    if (this.pieceList.almostEmpty()) {
      this.pubSub.publish(GET_PIECES);
    }
  }
}

module.exports = ServerBoard;
