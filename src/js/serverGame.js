const Game = require('common/js/game');
const ServerBoard = require('./serverBoard');


/**
 * Represents a server-side Tetris game
 */
class ServerGame extends Game {
  /**
   * Creates a ServerGame
   * @constructor
   * @param {object} pubSub - a publish/subscribe object
   * @param {number} playerId - playd id
   */
  constructor(pubSub, playerId) {
    super(playerId, pubSub, ServerBoard);
    this.pubSub = pubSub;
  }

  /**
   * Executes a given command
   * @param {string} action - command to execute
   */
  command(action) {
    const commands = {
      LEFT: () => this.board.movePiece(-1, 0),
      RIGHT: () => this.board.movePiece(1, 0),
      DOWN: () => this.board.movePiece(0, 1),
      AUTO_DOWN: () => this.board.movePiece(0, 1, 0),
      ROTATE_LEFT: () => this.board.rotatePiece(-1),
      ROTATE_RIGHT: () => this.board.rotatePiece(1),
      HARD_DROP: () => this.board.hardDrop(),
    }

    if ((action in commands) && this.gameStatus) commands[action]();
  }

  /**
   * Executes a list of commands (command queue)
   * @param {string[]} commands - list of commands to execute
   */
  executeCommandQueue(commands) {
    commands.forEach(action => this.command(action));

    this.pubSub.publish('updatePlayer', {
      id: this.playerId,
      board: this.board.grid,
    });
  }

  /**
 * Ends the current game.
 */
  gameOver() {
    this.unsubscribe();
    this.gameStatus = null;
  }

  /**
   * Unsubscribes from all pubSub topics.
   */
  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
  }
}

module.exports = ServerGame;