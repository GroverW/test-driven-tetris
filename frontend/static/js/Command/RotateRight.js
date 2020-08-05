const { CONTROLS, ROTATE_RIGHT } = require('frontend/helpers/clientConstants');
const { ADD_LOCK_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class RotateRight extends Command {
  constructor(game) {
    super(CONTROLS.ROTATE_RIGHT, game.movement.bind(game, 'rotatePiece', ROTATE_RIGHT));
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return CONTROLS.RIGHT;
  }
}

module.exports = RotateRight;
