const { CONTROLS, MOVE_SPEED } = require('frontend/helpers/clientConstants');
const { ADD_LOCK_DELAY } = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const Command = require('.');

class MoveLeft extends Command {
  constructor(board) {
    super(CONTROLS.LEFT, board.movePiece.bind(board, 1, 0), MOVE_SPEED);
  }

  execute() {
    super.execute();
    publish(ADD_LOCK_DELAY);
  }
}

module.exports = MoveLeft;
