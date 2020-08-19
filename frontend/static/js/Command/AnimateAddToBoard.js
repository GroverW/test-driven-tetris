const { publish } = require('frontend/helpers/pubSub');
const { DRAW } = require('frontend/topics');
const Command = require('.');

class AnimateAddToBoard extends Command {
  constructor(piece) {
    super(null, null, [0, 0, 0, 0]);
    this.piece = piece;
    this.type = 'animation';
  }

  executeCallback() {
    publish(DRAW, { piece: this.piece, brightness: 1 });
  }
}

module.exports = AnimateAddToBoard;
