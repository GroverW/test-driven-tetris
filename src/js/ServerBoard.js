const Board = require('common/js/Board');
const { GET_PIECES } = require('backend/helpers/serverTopics');


/**
 * Represents a server-side game board
 */
class ServerBoard extends Board {
  /**
 * @constructor
 * @param {object} pubSub - Publish / Subscribe object
 * @param {number} playerId - Id of player on backend
 */
  constructor(pubSub, playerId) {
    super(pubSub, playerId);
  }

  /**
   * Sets the current and next pieces
   */
  getPieces() {
    super.getPieces();

    if (this.pieceList.almostEmpty()) {
      this.pubSub.publish(GET_PIECES);
    }
  }

  /**
   * Clears completed lines after piece added to board
   */
  clearLines() {
    const numCleared = super.clearLines();
    if (numCleared > 0) this.publishBoardUpdate();
  }

  /**
   * Publishes any board updates
   */
  // publishBoardUpdate() {
  //   this.pubSub.publish('updateBoard', {
  //     id: this.id,
  //     board: this.grid
  //   })
  // }
}

module.exports = ServerBoard;