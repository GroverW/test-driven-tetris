const Game = require('common/js/Game');

const pubSub = require('frontend/helpers/pubSub');
const { mapArrayToObj } = require('common/helpers/utils');

const { PLAYER_KEYS, COMMAND_QUEUE_MAP } = require('frontend/constants');
const {
  START_GAME,
  BOARD_CHANGE,
  UPDATE_PLAYER,
  ADD_PLAYER,
  REMOVE_PLAYER,
  DRAW,
  EXECUTE_COMMANDS,
  USE_POWER_UP,
  LOWER_PIECE,
  UPDATE_SCORE,
  SEND_MESSAGE,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
  ADD_TO_QUEUE,
  CLEAR_QUEUE,
} = require('frontend/topics');

const { getCommandList } = require('frontend/static/js/Command/getCommandList');
const ClientBoard = require('./ClientBoard');
const Gravity = require('./Gravity');


/**
 * Represents a client-side Tetris game
 * @extends Game
 */
class ClientGame extends Game {
  /**
   * Creates a ClientGame.
   * @constructor
   * @param {number} playerId - Links client to backend Game.
   */
  constructor(playerId) {
    super(playerId, pubSub, ClientBoard);
    this.players = [];
    this.playerTargets = {};
    this.commandQueue = [];
    this.mapSubscriptions([
      START_GAME, BOARD_CHANGE, UPDATE_PLAYER, ADD_PLAYER, REMOVE_PLAYER, ADD_TO_QUEUE, CLEAR_QUEUE,
    ]);
    this.commands = getCommandList(this);
  }

  /**
   * Client-side implentation of start method.
   */
  [START_GAME]() {
    if (this.start()) {
      this.pubSub.publish(DRAW, {
        grid: this.board.grid,
        piece: this.board.piece,
        nextPiece: this.board.nextPiece,
      });

      this.pubSub.publish(UPDATE_SCORE, {
        score: this.score,
        level: this.level,
        lines: this.linesRemaining,
      });

      this.pubSub.publish(SET_AUTO_COMMAND, new Gravity(this.playerId, this, this.board));
    }
  }

  /**
   * Adds an additional player to the game
   * @param {number} id - player id
   */
  [ADD_PLAYER](id) {
    if (this.gameStatus || this.players.includes(id)) return;

    this.players.push(id);
    this.mapPlayerTargets();
  }

  /**
   * Removes additional player from the game
   * @param {number} id - player id
   */
  [REMOVE_PLAYER](id) {
    this.players = this.players.filter((pId) => pId !== id);
    this.mapPlayerTargets();
  }

  /**
   * Replaces the current board with a new one
   * @param {number} id - id of player
   * @param {number[][]} grid - board to update
   */
  [UPDATE_PLAYER]({ id, grid }) {
    if (id === this.playerId) this.board.replaceBoard(grid);
  }

  /**
   * Maps keyboard controls to actual player ids
   */
  mapPlayerTargets() {
    this.playerTargets = mapArrayToObj(PLAYER_KEYS, (_, i) => (this.players[i - 1] ? `PLAYER${this.players[i - 1]}` : false));

    this.playerTargets[PLAYER_KEYS[0]] = `PLAYER${this.playerId}`;
  }

  movement(boardKey, controlKey, ...args) {
    if ((boardKey in this.board) && this.gameStatus) {
      this[ADD_TO_QUEUE](controlKey);
      this.board[boardKey](...args);
    }
  }

  /**
   * Executes movement command.
   * @param {number} key - Keypress identifier
   */
  command(key, upDown) {
    if ((key in this.commands) && this.gameStatus) {
      this.publishCommand(key, upDown);
    } else if (!this.gameStatus) {
      this.sendCommandQueue();
    }
  }

  publishCommand(key, upDown) {
    if (upDown === 'down') {
      this.pubSub.publish(SET_COMMAND, this.commands[key]());
    } else if (upDown === 'up') {
      this.pubSub.publish(CLEAR_COMMAND, key);
    }
  }

  [BOARD_CHANGE]() {
    this.sendCommandQueue();
  }

  /**
   * Adds command to command queue.
   * @param {number} key - Keypress identifier
   */
  [ADD_TO_QUEUE](key) {
    if (key in this.playerTargets) {
      this.commandQueue.push(this.playerTargets[key]);
    } else if (key in COMMAND_QUEUE_MAP) {
      this.commandQueue.push(COMMAND_QUEUE_MAP[key]);
    }
  }

  [CLEAR_QUEUE]() {
    this.commandQueue = [];
  }

  /**
   * Sends current command queue to backend.
   */
  sendCommandQueue() {
    this.pubSub.publish(SEND_MESSAGE, {
      type: EXECUTE_COMMANDS,
      data: this.commandQueue,
    });

    this[CLEAR_QUEUE]();
  }

  /**
   * Maps keypress id to player id and sends command queue
   * @param {number} player - keypress id
   */
  usePowerUp(player) {
    if (this.playerTargets[player]) {
      this[ADD_TO_QUEUE](player);
      this.sendCommandQueue();
      this.pubSub.publish(USE_POWER_UP);
    }
  }

  /**
   * Updates game score.
   * @param {number} points - number of points to add to game score
   */
  [LOWER_PIECE](points) {
    super[LOWER_PIECE](points);

    this.pubSub.publish(UPDATE_SCORE, {
      score: this.score,
    });
  }

  /**
   * Updates level, and number of lines remaining until next level.
   * @param {number} lines - number of lines cleared
   */
  updateLinesRemaining(lines) {
    super.updateLinesRemaining(lines);

    this.pubSub.publish(UPDATE_SCORE, {
      level: this.level,
      lines: this.linesRemaining,
    });
  }

  /**
   * Ends the current game.
   * @param {number} id - id of player whose game is over
   */
  gameOver({ id }) {
    if (id === this.playerId) {
      this.gameStatus = null;
    }
  }
}

module.exports = ClientGame;
