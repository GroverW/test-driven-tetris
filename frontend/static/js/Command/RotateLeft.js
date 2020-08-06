const { CONTROLS } = require('frontend/constants');
const { ADD_LOCK_DELAY } = require('frontend/topics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

const { ROTATE_LEFT } = CONTROLS;

class RotateLeft extends Command {
  constructor(game) {
    super(ROTATE_LEFT, game.movement.bind(game, 'rotatePiece', ROTATE_LEFT, -1));
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return ROTATE_LEFT;
  }
}

module.exports = RotateLeft;
