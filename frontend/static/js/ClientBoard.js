const Board = require('common/js/Board');
const { POINTS } = require('frontend/helpers/clientConstants');
const { DRAW, BOARD_CHANGE } = require('frontend/helpers/clientTopics');


/**
 * Represents a client-side game board
 * @extends Board
 */
class ClientBoard extends Board {
  /**
   * @constructor
   * @param {object} pubSub - Publish / Subscribe object
   * @param {number} playerId - Id of player on backend
   */
  constructor(pubSub, playerId) {
    super(pubSub, playerId)
  }

  /**
   * Moves the current piece to a new place on the board
   * @param {number} x - The number of spaces to move in the x-direction
   * @param {number} y - The number of spaces to move in the y-direection
   * @param {number} multiplier - Points multiplier based on type of movement
   * @returns {boolean} - Whether or not the move was valid.
   */
  movePiece(x, y, multiplier = POINTS.DOWN) {
    if(super.movePiece(x, y, multiplier)) {
      if(multiplier < POINTS.HARD_DROP) {
        this.pubSub.publish(DRAW, {
          board: this.grid,
          piece: this.piece
        })
      }
    }
  }

    /**
   * Rotates the current piece clockwise or counter-clockwise
   * @param {number} direction - (-1) for counter-clockwise, (1) for clockwise
   */
  rotatePiece(direction) {
    super.rotatePiece(direction)

    this.pubSub.publish(DRAW, {
      board: this.grid,
      piece: this.piece
    })
  }

    /**
   * Publishes any board updates
   */
  publishBoardUpdate() {
    this.pubSub.publish(BOARD_CHANGE, this.grid)

    this.pubSub.publish(DRAW, {
      board: this.grid,
      piece: this.piece,
      nextPiece: this.nextPiece
    })
  }
}

module.exports = ClientBoard;