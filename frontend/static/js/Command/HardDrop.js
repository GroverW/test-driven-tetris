const { CONTROLS } = require('frontend/helpers/clientConstants');
const Command = require('.');

class HardDrop extends Command {
  constructor(game) {
    super(CONTROLS.HARD_DROP, game.movement.bind(game, 'hardDrop'));
  }
}

module.exports = HardDrop;
