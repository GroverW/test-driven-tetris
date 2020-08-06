const { CONTROLS, MOVE_SPEED } = require('frontend/constants');
const { ADD_LOCK_DELAY } = require('frontend/topics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

const { RIGHT } = CONTROLS;

class MoveRight extends Command {
  constructor(game) {
    super(RIGHT, game.movement.bind(game, 'movePiece', RIGHT, 1, 0), MOVE_SPEED);
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return RIGHT;
  }
}

module.exports = MoveRight;
