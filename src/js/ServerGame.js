const Game = require('common/js/Game');
const ServerBoard = require('./ServerBoard');
const {
  GAME_TYPES,
  PLAYERS,
  POWER_UPS,
  MAX_POWER_UPS,
  POWER_UP_LIST
} = require('backend/helpers/serverConstants');
const {
  UPDATE_PLAYER,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('backend/helpers/serverTopics');
const { mapArrayToObj } = require('common/helpers/utils');


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
  constructor(pubSub, playerId, gameType) {
    super(playerId, pubSub, ServerBoard);
    this.gameType = gameType;
    this.pubSub = pubSub;
    this.powerUps = [];
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
      ...mapArrayToObj(PLAYERS, (p, i) => () => this.usePowerUp(i + 1))
    }

    if ((action in commands) && this.gameStatus) commands[action]();
  }

  /**
   * Executes a list of commands (command queue)
   * @param {string[]} commands - list of commands to execute
   */
  executeCommandQueue(commands) {
    commands.forEach((action) => this.command(action));

    this.pubSub.publish(UPDATE_PLAYER, {
      id: this.playerId,
      board: this.board.grid,
    });
  }

  /**
   * Adds a power up to the current power up list
   * @param {number} powerUp - power up id
   */
  addPowerUp(powerUp) {
    if (
      this.gameType === GAME_TYPES.MULTI &&
      POWER_UPS.has(powerUp) &&
      this.powerUps.length < MAX_POWER_UPS
    ) {
      this.powerUps.push(powerUp);
      this.pubSub.publish(ADD_POWER_UP, { powerUp, id: this.playerId, });
    }
  }

  /**
   * Removes the first power up and publishes a message to execute it
   * against the specified player
   * @param {number} id - player id
   */
  usePowerUp(id) {
    if (this.powerUps.length) {
      const powerUp = this.powerUps.shift();
      this.pubSub.publish(USE_POWER_UP, {
        powerUp,
        player1: this.playerId,
        player2: id,
      });
    }
  }

  /**
   * Adds random power up from power up list
   * @returns {number} - power up id
   */
  getRandomPowerUp() {
    const idx = Math.floor(Math.random() * POWER_UP_LIST.length);
    return POWER_UP_LIST[idx];
  }

  /**
   * Updates score and lines remaining based on number of lines cleared
   * Has chance to add random power up
   * @param {number} lines - number of lines cleared
   */
  clearLines(lines) {
    super.clearLines(lines);
    if (lines > 0) this.addPowerUp(this.getRandomPowerUp());
  }

  /**
 * Ends the current game.
 */
  gameOver() {
    this.unsubscribe();
    this.gameStatus = null;
  }
}

module.exports = ServerGame;