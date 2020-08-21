const { publish } = require('frontend/helpers/pubSub');
const { DRAW } = require('frontend/topics');
const Command = require('..');

class AnimateClearLines extends Command {
  constructor(grid) {
    super(null, null, [0, 0, 0, 0]);
    this.brightnessMap = [1, 2, 3, 4];
    this.grid = grid;
    this.type = 'animation';
  }

  get brightness() {
    return this.brightnessMap[this.delayIdx];
  }

  executeCallback() {
    const { grid, brightness } = this;
    publish(DRAW, { grid, brightness });
  }
}

module.exports = AnimateClearLines;
