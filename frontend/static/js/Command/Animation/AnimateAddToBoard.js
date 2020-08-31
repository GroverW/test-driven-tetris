const { publish } = require('frontend/helpers/pubSub');
const { DRAW } = require('frontend/topics');
const Command = require('..');

class AnimateAddToBoard extends Command {
  constructor(piece) {
    super(null, null, [0, 0, 0, 0, 0]);
    this.brightnessMap = [2, 4, 3, 2, 1];
    this.piece = piece;
    this.type = 'animation';
  }

  get brightness() {
    return this.brightnessMap[this.delayIdx];
  }

  executeCallback() {
    const { piece, brightness } = this;
    publish(DRAW, { piece, brightness });
  }
}

module.exports = AnimateAddToBoard;
