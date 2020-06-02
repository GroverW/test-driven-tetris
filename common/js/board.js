const { BOARD_WIDTH, BOARD_HEIGHT, POINTS, WALL_KICK_TESTS, WALL_KICK_TESTS_I } = require('../helpers/constants');
const { getEmptyBoard } = require('common/helpers/utils');
const { PieceList, Piece } = require('./piece');

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
    this.piece;
    this.nextPiece;
    this.pubSub = pubSub;
    this.pieceList = new PieceList();
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
      this.pubSub.publish("gameOver", {
        id: this.playerId,
        board: this.grid
      });
    }

    this.nextPiece = new Piece(this.pieceList.getNextPiece());
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

      if (y > 0) this.pubSub.publish('lowerPiece', y * multiplier)
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
    this.publishBoardUpdate();
  }

  /**
   * Moves the current piece to the lowest, valid position possible
   * and adds it to the board.
   */
  hardDrop() {
    let yChange = 0;

    while (this.validMove(0, ++yChange)) continue;

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
    return this.piece.grid.every((row, yDiff) =>
      row.every((cell, xDiff) =>
        (cell === 0
          || (this.isInBounds(xStart + xDiff, yStart + yDiff)
            && this.isEmpty(xStart + xDiff, yStart + yDiff))
        )
      )
    )
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
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
  }

  /**
   * Rotates the current piece clockwise or counter-clockwise
   * @param {number} direction - (-1) for counter-clockwise, (1) for clockwise
   */
  rotatePiece(direction) {
    // determines which set of tests to use based on type of piece
    const lookup = this.piece.type === 1
      ? WALL_KICK_TESTS_I
      : WALL_KICK_TESTS;

    const tests = lookup[direction][this.piece.rotation];
    this.piece.update(direction);

    // runs tests for current piece to determine if a valid rotation can be made
    for (let [xChange, yChange] of tests) {
      if (this.validMove(xChange, yChange)) {
        const diff = (xChange !== 0 || yChange !== 0);
        // moves piece if a valid location could be found for it
        diff && this.movePiece(xChange, yChange, 0);
        return;
      }
    }

    // undoes rotation if no valid position could be found
    this.piece.update(-direction);
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
      })
    });
  }

  /**
   * Clears completed lines after piece added to board
   * @returns {number} - number of lines cleared
   */
  clearLines() {
    let numCleared = 0;

    this.grid.forEach((row, rowInd) => {
      if (row.every(cell => cell > 0)) {
        this.grid.splice(rowInd, 1);
        this.grid.unshift(Array(BOARD_WIDTH).fill(0));
        numCleared++;
      }
    })

    numCleared && this.pubSub.publish('clearLines', numCleared);

    return numCleared;
  }

  /**
   * Replaces current grid with new one. Moves current piece if too close to new grid.
   * @param {array} newGrid - new grid to replace current grid
   */
  replaceBoard(newGrid) {
    const [yStart, yEnd, xStart, xEnd] = this.getPieceBounds();

    let maxHeight = BOARD_HEIGHT;

    // check for first space below piece that is not empty
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = xStart; col <= xEnd; col++) {
        if (newGrid[row][col] > 0) {
          maxHeight = Math.min(maxHeight, row);
        }
      }
    }

    const heightDiff = maxHeight - yEnd;
    
    // try to move piece at max 5 spaces from maxHeight if not already
    if (heightDiff < 5) {
      const yMove = Math.max(heightDiff - 5, -yStart);
      this.movePiece(0, yMove, 0)
    }

    this.grid = newGrid;
  }

  /**
   * Gets the minimum and maximum x and y bounds of the current piece
   * @returns {array} - [yStart, yEnd, xStart, xEnd]
   */
  getPieceBounds() {
    let yMin = BOARD_HEIGHT;
    let yMax = 0;
    let xMin = BOARD_WIDTH;
    let xMax = 0;

    for (let row = 0; row < this.piece.grid.length; row++) {
      for (let col = 0; col < this.piece.grid[0].length; col++) {
        const yPosition = this.piece.y + row;
        const xPosition = this.piece.x + col;

        if (this.piece.grid[row][col] !== 0) {
          yMin = Math.min(yMin, yPosition);
          yMax = Math.max(yMax, yPosition);
          xMin = Math.min(xMin, xPosition);
          xMax = Math.max(xMax, xPosition);
        }
      }
    }

    return [yMin, yMax, xMin, xMax];
  }

  /**
   * Publishes any board updates
   */
  publishBoardUpdate() {
    // to be implemented by server and client
  }
}

module.exports = Board;