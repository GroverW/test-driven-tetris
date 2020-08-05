const { CONTROLS, MOVE_SPEED } = require('frontend/helpers/clientConstants');
const { INTERRUPT_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

const { DOWN } = CONTROLS;

class MoveDown extends Command {
  constructor(game) {
    super(DOWN, game.movement.bind(game, 'movePiece', DOWN, 0, 1), MOVE_SPEED);
  }

  executeCallback() {
    publish(INTERRUPT_DELAY);
    super.executeCallback();
  }

  static getKey() {
    return DOWN;
  }
}

module.exports = MoveDown;
