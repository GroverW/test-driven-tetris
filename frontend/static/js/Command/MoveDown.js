const { CONTROLS, MOVE_SPEED } = require('frontend/helpers/clientConstants');
const { INTERRUPT_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class MoveDown extends Command {
  constructor(game) {
    super(CONTROLS.DOWN, game.movement.bind(game, 'movePiece', 0, 1), MOVE_SPEED);
  }

  executeCallback() {
    publish(INTERRUPT_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return CONTROLS.DOWN;
  }
}

module.exports = MoveDown;
