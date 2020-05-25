const { BOARD_WIDTH, BOARD_HEIGHT, POINTS } = require('../helpers/data');
const { getEmptyBoard } = require('../helpers/utils');
const { PieceList, Piece } = require('./piece');

class Board {
  constructor(pubSub, playerId) {
    this.playerId = playerId;
    this.grid = getEmptyBoard();
    this.piece;
    this.nextPiece;
    this.pubSub = pubSub;
    this.pieceList = new PieceList();
  }

  createEmptyGrid() {
    return getEmptyBoard();
  }

  getPieces() {
    this.piece = this.nextPiece
      ? this.nextPiece
      : new Piece(this.pieceList.getNextPiece());
    
    if(!this.validMove(0,0)) {
      this.pubSub.publish("gameOver", {
        id: this.playerId,
        board: this.grid
      });
    }

    this.nextPiece = new Piece(this.pieceList.getNextPiece());

    if(this.pieceList.almostEmpty()) {
      this.pubSub.publish("getPieces")
    }
  }

  movePiece(x, y, multiplier = POINTS.DOWN) {
    if (this.validMove(x, y)) {
      this.piece.move(x, y);
      
      if(y > 0) this.pubSub.publish('lowerPiece', y * multiplier)

      return true;
    }

    if(y > 0) this.drop()

    return false;
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
    return this.grid[y][x] === 0;
  }

  isInBounds(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT;
  }

  rotatePiece(piece, direction) {
    this.wallKick(piece);

    // let newGrid = JSON.parse(JSON.stringify(piece.grid));

    // for (let i = 0; i < newGrid.length; i++) {
    //   for (let j = 0; j < i; j++) {
    //     [newGrid[j][i], newGrid[i][j]] = [newGrid[i][j], newGrid[j][i]];
    //   }
    // }

    // direction > 0
    //   ? newGrid.forEach(row => row.reverse())
    //   : newGrid.reverse();

    piece.update(direction);
  }

  wallKick(piece) {
    const pStart = piece.x;
    const pEnd = piece.x + piece.grid[0].length;
    const bStart = 0;
    const bEnd = this.grid[0].length;

    if(pStart < bStart) this.movePiece(bStart - pStart, 0);
    if(pEnd > bEnd) this.movePiece(bEnd - pEnd, 0);
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
    
    if(numCleared) {
      this.pubSub.publish('clearLines', numCleared);
      this.publishBoardUpdate();
    } 
  }

  publishBoardUpdate() {
    this.pubSub.publish('updateBoard', {
      id: this.id,
      board: this.grid
    })
  }
}

module.exports = Board;