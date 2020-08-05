const { CONTROLS, ROTATE_LEFT } = require('frontend/helpers/clientConstants');
const { ADD_LOCK_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class RotateLeft extends Command {
  constructor(game) {
    super(CONTROLS.ROTATE_LEFT, game.movement.bind(game, 'rotatePiece', ROTATE_LEFT));
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return CONTROLS.ROTATE_LEFT;
  }
}

module.exports = RotateLeft;
