const Command = require('.');

class PowerUp extends Command {
  constructor(key, game) {
    super(key, game.usePowerUp.bind(game, key));
  }
}

module.exports = PowerUp;
