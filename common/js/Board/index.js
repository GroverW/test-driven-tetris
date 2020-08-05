const {
  BOARD_WIDTH, BOARD_HEIGHT, POINTS, PIECE_TYPES,
  MAX_FLOOR_KICKS, WALL_KICK_TESTS, WALL_KICK_TESTS_I,
} = require('common/constants');
const { GAME_OVER, LOWER_PIECE, CLEAR_LINES } = require('common/topics');
const { getEmptyBoard } = require('common/helpers/utils');
const Piece = require('common/js/Piece');
const PieceList = require('common/js/PieceList');
const { getMaxGridHeight } = require('./boardHelpers');

/**
 * Represents a game board
 */
class Board {
  /**
   * @constructor
   * @param {object} pubSub - Publish / Subscribe object
   * @param {number} playerId - Id of player linking backend to frontend
   */
  constructor(pubSub, playerId) {
    this.playerId = playerId;
    this.grid = getEmptyBoard();
    this.pubSub = pubSub;
    this.pieceList = new PieceList();
    this.resetRemainingFloorKicks();
  }

  /**
   * Sets the current and next pieces
   */
  getPieces() {
    this.piece = this.nextPiece
      ? this.nextPiece
      : new Piece(this.pieceList.getNextPiece());

    // Game Over condition. If a new piece cannot be set because it's blocked
    if (!this.validMove(0, 0)) {
      this.pubSub.publish(GAME_OVER, {
        id: this.playerId,
        board: this.grid,
      });
    }

    this.nextPiece = new Piece(this.pieceList.getNextPiece());
    this.resetRemainingFloorKicks();
  }

  /**
   * Moves the current piece to a new place on the board
   * @param {number} x - The number of spaces to move in the x-direction
   * @param {number} y - The number of spaces to move in the y-direection
   * @param {number} multiplier [multiplier=1] - Points multiplier based on type of movement
   * @returns {boolean} - Whether or not the move was valid.
   */
  movePiece(x, y, multiplier = POINTS.DOWN) {
    const validMove = this.validMove(x, y);

    if (validMove) {
      this.piece.move(x, y);

      if (y > 0) this.pubSub.publish(LOWER_PIECE, y * multiplier);
    } else if (y > 0 && multiplier !== POINTS.DOWN) {
      this.drop();
    }

    return validMove;
  }

  /**
   * Adds the current piece to the board. Clears any completed lines,
   * gets new pieces and publishes board updates.
   */
  drop() {
    this.addPieceToBoard();
    this.clearLines();
    this.getPieces();
  }

  /**
   * Moves the current piece to the lowest, valid position possible
   * and adds it to the board.
   */
  hardDrop() {
    let yChange = 1;

    while (this.validMove(0, yChange)) yChange += 1;

    this.movePiece(0, yChange - 1, POINTS.HARD_DROP);
    this.drop();
  }

  /**
   * Checks whether the requested movement is valid
   * @param {number} xChange - requested x-movement
   * @param {number} yChange - requested y-movement
   * @returns {boolean} - whether or not the requested move is valid
   */
  validMove(xChange, yChange) {
    const xStart = this.piece.x + xChange;
    const yStart = this.piece.y + yChange;
    return this.piece.grid.every((row, yDiff) => (
      row.every((cell, xDiff) => (
        cell === 0
        || (
          this.isInBounds(xStart + xDiff, yStart + yDiff)
          && this.isEmpty(xStart + xDiff, yStart + yDiff)
        )
      ))
    ));
  }

  /**
   * Checks whether the requested board coordinates are unoccupied
   * @param {number} x - x-coordinate
   * @param {number} y - y-coordinate
   * @returns {boolean} - whether or not the requested coordinatea are unoccupied
   */
  isEmpty(x, y) {
    return y >= 0 && this.grid[y][x] === 0;
  }

  /**
   * Checks whether the requested board coordinates are in-bounds
   * @param {number} x - x-coordinate
   * @param {number} y - y-coordinate
   * @returns {boolean} - whether the requested board coordinates are in-bounds
   */
  isInBounds(x, y) {
    return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length;
  }

  /**
   * Rotates the current piece clockwise or counter-clockwise
   * @param {number} direction - (-1) for counter-clockwise, (1) for clockwise
   */
  rotatePiece(direction) {
    // determines which set of tests to use based on type of piece
    const lookup = this.piece.type === PIECE_TYPES.I
      ? WALL_KICK_TESTS_I
      : WALL_KICK_TESTS;

    const currentDirection = this.piece.rotation;
    const tests = lookup[direction][currentDirection];
    this.piece.update(direction);

    if (this.wallKick(tests)) return;

    // undoes rotation if can't wall kick
    this.piece.update(-direction);
  }

  /**
   * Tests for valid positioning for piece based on current rotation and desired rotation
   * @param {number[][]} tests - lists of tests in format [xChange, yChange] to attempt wall kick
   * @returns {boolean} - whether or not wallKick was successful
   */
  wallKick(tests) {
    // runs tests for current piece to determine if a valid rotation can be made
    const validTest = this.getValidTest(tests);

    if (validTest) {
      const [xChange, yChange] = validTest;

      if (!this.checkAndUpdateFloorKicks(yChange)) return false;

      this.handleWallKick(xChange, yChange);

      return true;
    }

    return false;
  }

  getValidTest(tests) {
    return tests.find(([xChange, yChange]) => this.validMove(xChange, yChange));
  }

  checkAndUpdateFloorKicks(yChange) {
    if (yChange >= 0) return true;

    if (this.floorKicksRemaining <= 0) return false;

    this.floorKicksRemaining -= 1;
    return true;
  }

  handleWallKick(xChange, yChange) {
    if (xChange === 0 && yChange === 0) return;

    this.movePiece(xChange, yChange, 0);
  }

  resetRemainingFloorKicks() {
    this.floorKicksRemaining = MAX_FLOOR_KICKS;
  }

  /**
   * Adds the current piece to the board
   */
  addPieceToBoard() {
    const xStart = this.piece.x;
    const yStart = this.piece.y;
    this.piece.grid.forEach((row, yDiff) => {
      row.forEach((cell, xDiff) => {
        if (cell > 0) this.grid[yStart + yDiff][xStart + xDiff] = cell;
      });
    });
  }

  /**
   * Clears completed lines after piece added to board
   * @returns {number} - number of lines cleared
   */
  clearLines() {
    let numCleared = 0;

    this.grid.forEach((row, rowInd) => {
      if (row.every((cell) => cell > 0)) {
        this.grid.splice(rowInd, 1);
        this.grid.unshift(Array(BOARD_WIDTH).fill(0));
        numCleared += 1;
      }
    });

    if (numCleared > 0) this.pubSub.publish(CLEAR_LINES, numCleared);

    return numCleared;
  }

  /**
   * Replaces current grid with new one. Moves current piece if too close to new grid.
   * @param {number[][]} newGrid - new grid to replace current grid
   */
  replaceBoard(newGrid) {
    const [yStart, yEnd, xStart, xEnd] = this.getPieceBounds();

    const maxHeight = getMaxGridHeight(xStart, xEnd, newGrid);

    const heightDiff = maxHeight - yEnd;

    // try to move piece at max 5 spaces from maxHeight if not already
    if (heightDiff < 5) {
      const yMove = Math.max(heightDiff - 5, -yStart);
      this.movePiece(0, yMove, 0);
    }

    this.grid = newGrid;
  }

  /**
   * Gets the minimum and maximum x and y bounds of the current piece
   * @returns {number[]} - [yStart, yEnd, xStart, xEnd]
   */
  getPieceBounds() {
    let yMin = BOARD_HEIGHT;
    let yMax = 0;
    let xMin = BOARD_WIDTH;
    let xMax = 0;
    const { x, y } = this.piece;

    this.piece.grid.forEach((line, row) => (
      line.forEach((val, col) => {
        if (val > 0) {
          const yPosition = y + row;
          const xPosition = x + col;

          yMin = Math.min(yMin, yPosition);
          yMax = Math.max(yMax, yPosition);
          xMin = Math.min(xMin, xPosition);
          xMax = Math.max(xMax, xPosition);
        }
      })));

    return [yMin, yMax, xMin, xMax];
  }
}

module.exports = Board;
