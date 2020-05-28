const Board = require('../../common/js/board');

class ServerBoard extends Board {
  constructor(pubSub, playerId) {
    super(pubSub, playerId);
  }

  getPieces() {
    super.getPieces();
    
    if(this.pieceList.almostEmpty()) {
      this.pubSub.publish('getPieces');
    }
  }

  clearLines() {
    const numCleared = super.clearLines();
    numCleared && this.publishBoardUpdate();
  }

  publishBoardUpdate() {
    this.pubSub.publish('updateBoard', {
      id: this.id,
      board: this.grid
    })
  }
}

module.exports = ServerBoard;