const { CONTROLS, MOVE_SPEED } = require('frontend/helpers/clientConstants');
const { ADD_LOCK_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class MoveLeft extends Command {
  constructor(game) {
    super(CONTROLS.LEFT, game.movement.bind(game, 'movePiece', -1, 0), MOVE_SPEED);
  }

  executeCallback() {
    publish(ADD_LOCK_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return CONTROLS.LEFT;
  }
}

module.exports = MoveLeft;
