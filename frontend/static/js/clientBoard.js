const Board = require('../../../common/js/board');
const { publish } = require('../../helpers/pubSub')
const { POINTS } = require('../../helpers/clientConstants');

class ClientBoard extends Board {
  constructor(playerId) {
    super(publish, playerId)
  }

  movePiece(x, y, multiplier = POINTS.DOWN) {
    if(super.movePiece(x, y, multiplier)) {
      if(multiplier < POINTS.HARD_DROP) {
        this.publish('draw', {
          board: this.grid,
          piece: this.piece
        })
      }
    }
  }
  
  clearLines() {
    const numCleared = super.clearLines();

    numCleared && this.publish('clearLines', numCleared);
  }

  publishBoardUpdate() {
    this.publish('boardChange', this.grid)

    this.publish('draw', {
      board: this.grid,
      piece: this.piece,
      nextPiece: this.nextPiece
    })
  }
}

module.exports = ClientBoard;