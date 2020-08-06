const { CONTROLS, MOVE_SPEED } = require('frontend/constants');
const { ADD_LOCK_DELAY } = require('frontend/topics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

const { LEFT } = CONTROLS;

class MoveLeft extends Command {
  constructor(game) {
    super(LEFT, game.movement.bind(game, 'movePiece', LEFT, -1, 0), MOVE_SPEED);
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return LEFT;
  }
}

module.exports = MoveLeft;
