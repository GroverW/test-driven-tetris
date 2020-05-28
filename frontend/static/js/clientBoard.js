const Board = require('common/js/board');
const { POINTS } = require('frontend/helpers/clientConstants');

class ClientBoard extends Board {
  constructor(pubSub, playerId) {
    super(pubSub, playerId)
  }

  movePiece(x, y, multiplier = POINTS.DOWN) {
    if(super.movePiece(x, y, multiplier)) {
      if(multiplier < POINTS.HARD_DROP) {
        this.pubSub.publish('draw', {
          board: this.grid,
          piece: this.piece
        })
      }
    }
  }

  rotatePiece(direction) {
    super.rotatePiece(direction)

    this.pubSub.publish('draw', {
      board: this.grid,
      piece: this.piece
    })
  }

  publishBoardUpdate() {
    this.pubSub.publish('boardChange', this.grid)

    this.pubSub.publish('draw', {
      board: this.grid,
      piece: this.piece,
      nextPiece: this.nextPiece
    })
  }
}

module.exports = ClientBoard;