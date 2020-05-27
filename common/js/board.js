const { BOARD_WIDTH, BOARD_HEIGHT, POINTS, WALL_KICK_TESTS, WALL_KICK_TESTS_I } = require('../helpers/constants');
const { getEmptyBoard } = require('../helpers/utils');
const { PieceList, Piece } = require('./piece');

class Board {
  constructor(publish, playerId) {
    this.playerId = playerId;
    this.grid = getEmptyBoard();
    this.piece;
    this.nextPiece;
    this.publish = publish;
    this.pieceList = new PieceList();
  }

  getPieces() {
    this.piece = this.nextPiece
      ? this.nextPiece
      : new Piece(this.pieceList.getNextPiece());
    
    if(!this.validMove(0,0)) {
      this.publish("gameOver", {
        id: this.playerId,
        board: this.grid
      });
    }

    this.nextPiece = new Piece(this.pieceList.getNextPiece());
  }

  // server version
  movePiece(x, y, multiplier = POINTS.DOWN) {
    const validMove = this.validMove(x, y);

    if (validMove) {
      this.piece.move(x, y);
      
      if(y > 0) this.publish('lowerPiece', y * multiplier)
    } else if(y > 0 && multiplier !== POINTS.DOWN) {
      this.drop();
    }

    return validMove;
  }

  drop() {
    this.addPieceToBoard();
    this.clearLines();
    this.getPieces();
    this.publishBoardUpdate();
  }

  hardDrop() {
    let yChange = 0;

    while (this.validMove(0, ++yChange)) continue;

    this.movePiece(0, yChange - 1, POINTS.HARD_DROP);
    this.drop();
  }

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

  isEmpty(x, y) {
    return y >= 0 && this.grid[y][x] === 0;
  }

  isInBounds(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
  }

  rotatePiece(direction) {
    const lookup = this.piece.type === 1 
      ? WALL_KICK_TESTS_I
      : WALL_KICK_TESTS;

    const tests = lookup[direction][this.piece.rotation];
    this.piece.update(direction);

    for(let test of tests) {
      if(this.validMove(...test)) {
        this.movePiece(...test, 0);
        return;
      }
    }

    this.piece.update(-direction);
  }

  addPieceToBoard() {
    const xStart = this.piece.x;
    const yStart = this.piece.y;
    this.piece.grid.forEach((row, yDiff) => {
      row.forEach((cell, xDiff) => {
        if (cell > 0) this.grid[yStart + yDiff][xStart + xDiff] = cell;
      })
    });
  }

  clearLines() {
    let numCleared = 0;

    this.grid.forEach((row, rowInd) => {
      if(row.every(cell => cell > 0)) {
        this.grid.splice(rowInd, 1);
        this.grid.unshift(Array(BOARD_WIDTH).fill(0));
        numCleared++;
      }
    })

    return numCleared;
  }

  publishBoardUpdate() {
    // to be implemented by server and client
  }
}

module.exports = Board;