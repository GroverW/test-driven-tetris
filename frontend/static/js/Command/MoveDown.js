const { CONTROLS, MOVE_SPEED } = require('frontend/helpers/clientConstants');
const { INTERRUPT_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class MoveDown extends Command {
  constructor(board) {
    super(CONTROLS.DOWN, board.movePiece.bind(board, 0, 1), MOVE_SPEED);
  }

  execute() {
    super.execute();
    publish(INTERRUPT_DELAY);
  }
}

module.exports = MoveDown;
