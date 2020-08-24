const Board = require('common/js/Board');
const Animation = require('frontend/static/js/Command/Animation');
const AnimateAddToBoard = require('frontend/static/js/Command/Animation/AnimateAddToBoard');
const AnimateClearLines = require('frontend/static/js/Command/Animation/AnimateClearLines');
const Command = require('frontend/static/js/Command');
const { filterGrid } = require('frontend/helpers/utils');
const { POINTS } = require('frontend/constants');
const { DRAW, BOARD_CHANGE, SET_COMMAND, CLEAR_QUEUE } = require('frontend/topics');

/**
 * Represents a client-side game board
 * @extends Board
 */
class ClientBoard extends Board {
  /**
   * Moves the current piece to a new place on the board
   * @param {number} x - The number of spaces to move in the x-direction
   * @param {number} y - The number of spaces to move in the y-direection
   * @param {number} multiplier - Points multiplier based on type of movement
   * @returns {boolean} - Whether or not the move was valid.
   */
  getPieces() {
    super.getPieces();
    this.pubSub.publish(CLEAR_QUEUE);
  }

  movePiece(x, y, multiplier = POINTS.DOWN) {
    if (super.movePiece(x, y, multiplier)) {
      if (multiplier < POINTS.HARD_DROP) {
        this.publishDraw();
      }
    }
  }

  drop() {
    this.addPieceToBoard();
    this.publishBoardUpdate();

    const animation = new Animation(new AnimateAddToBoard(this.piece));
    const linesCleared = this.clearLines();

    if (linesCleared.length) {
      animation.addStep(new AnimateClearLines(filterGrid(this.grid, linesCleared)));
      animation.addStep(new Command(null, this.updateBoardState.bind(this)));
    }
    animation.addStep(new Command(null, this.getPieces.bind(this)));
    animation.addStep(new Command(null, this.publishDraw.bind(this)));

    this.pubSub.publish(SET_COMMAND, animation);
  }

  /**
   * Rotates the current piece clockwise or counter-clockwise
   * @param {number} direction - (-1) for counter-clockwise, (1) for clockwise
   */
  rotatePiece(direction) {
    super.rotatePiece(direction);

    this.publishDraw(this.grid, this.piece);
  }

  /**
   * Replaces current grid with new one. Moves current piece if too close to new grid.
   * @param {number[][]} newGrid - new board grid
   */
  replaceBoard(newGrid) {
    super.replaceBoard(newGrid);
    this.publishDraw(this.grid, this.piece);
  }

  isPieceAtLowestPoint() {
    return this.piece.y >= this.piece.maxY;
  }

  /**
   * Publishes any board updates
   */
  publishBoardUpdate() {
    this.pubSub.publish(BOARD_CHANGE);

    this.publishDraw(this.grid, this.piece, this.nextPiece);
  }

  publishDraw() {
    const { grid, piece, nextPiece } = this
    this.pubSub.publish(DRAW, { grid, piece, nextPiece });
  }
}

module.exports = ClientBoard;
