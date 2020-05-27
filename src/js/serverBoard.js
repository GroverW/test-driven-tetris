const Board = require('../../common/js/board');

class ServerBoard extends Board {
  constructor(publish, playerId) {
    super(publish, playerId);
  }

  getPieces() {
    super.getPieces();
    
    if(this.pieceList.almostEmpty()) {
      this.publish('getPieces');
    }
  }

  clearLines() {
    const numCleared = super.clearLines();

    if(numCleared) {
      this.publish('clearLines', numCleared);
      this.publishBoardUpdate();
    } 
  }

  publishBoardUpdate() {
    this.publish('updateBoard', {
      id: this.id,
      board: this.grid
    })
  }
}

module.exports = ServerBoard;