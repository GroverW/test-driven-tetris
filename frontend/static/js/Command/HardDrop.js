const { CONTROLS } = require('frontend/helpers/clientConstants');
const Command = require('.');

const { HARD_DROP } = CONTROLS;

class HardDrop extends Command {
  constructor(game) {
    super(HARD_DROP, game.movement.bind(game, 'hardDrop', HARD_DROP));
  }

  static getKey() {
    return HARD_DROP;
  }
}

module.exports = HardDrop;
