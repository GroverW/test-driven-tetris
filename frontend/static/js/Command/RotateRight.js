const { CONTROLS } = require('frontend/constants');
const { ADD_LOCK_DELAY } = require('frontend/topics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

const { ROTATE_RIGHT } = CONTROLS;

class RotateRight extends Command {
  constructor(game) {
    super(ROTATE_RIGHT, game.movement.bind(game, 'rotatePiece', ROTATE_RIGHT, 1));
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return ROTATE_RIGHT;
  }
}

module.exports = RotateRight;
