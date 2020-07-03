const Game = require('common/js/Game');
const ClientBoard = require('./ClientBoard');
const Command = require('./Command');
const {
  PLAYER_KEYS,
  CONTROLS,
  COMMAND_QUEUE_MAP,
  POWER_UP_KEY_CODES,
  MOVE_SPEED,
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('frontend/helpers/clientConstants');
const {
  START_GAME,
  BOARD_CHANGE,
  UPDATE_PLAYER,
  ADD_PLAYER,
  REMOVE_PLAYER,
  DRAW,
  ADD_PIECES,
  EXECUTE_COMMANDS,
  USE_POWER_UP,
  UPDATE_SCORE,
  SEND_MESSAGE,
} = require('frontend/helpers/clientTopics');
const { publish, subscribe } = require('frontend/helpers/pubSub');
const { mapArrayToObj } = require('common/helpers/utils');


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
    super(playerId, { publish, subscribe }, ClientBoard);
    this.players = [];
    this.time = { start: 0, elapsed: 0 };
    this.lockDelay = 0;
    this.interruptAutoDown = false;
    this.commandQueue = [];
    this.subscriptions.push(
      subscribe(START_GAME, this.start.bind(this)),
      subscribe(BOARD_CHANGE, this.sendCommandQueue.bind(this)),
      subscribe(UPDATE_PLAYER, this.replaceBoard.bind(this)),
      subscribe(ADD_PLAYER, this.addPlayer.bind(this)),
      subscribe(REMOVE_PLAYER, this.removePlayer.bind(this)),
      subscribe(ADD_PIECES, this.addPieces.bind(this)),
    );
  }

  /**
   * Client-side implentation of start method.
   */
  start() {
    if (super.start()) {
      publish(DRAW, {
        board: this.board.grid,
        piece: this.board.piece,
        nextPiece: this.board.nextPiece,
      });

      publish(UPDATE_SCORE, {
        score: this.score,
        level: this.level,
        lines: this.linesRemaining
      });
    }
  }

  /**
   * Adds an additional player to the game
   * @param {number} id - player id
   */
  addPlayer(id) {
    if (this.gameStatus || this.players.includes(id)) return;

    this.players.push(id);
  }

  /**
   * Removes additional player from the game
   * @param {number} id - player id
   */
  removePlayer(id) {
    this.players = this.players.filter((pId) => pId !== id);
  }

  /**
   * Replaces the current board with a new one
   * @param {number} id - id of player
   * @param {array} board - board to update
   */
  replaceBoard({ id, board }) {
    if (id === this.playerId) this.board.replaceBoard(board);
  }

  mapCommands() {
    const { LEFT, RIGHT, DOWN, AUTO_DOWN, ROTATE_LEFT, ROTATE_RIGHT, HARD_DROP } = CONTROLS;
    this.commands = {
      [LEFT]: new Command(LEFT, this.handleMovement.bind(this, -1, 0, 0), MOVE_SPEED),
      [RIGHT]: new Command(RIGHT, this.handleMovement.bind(this, 1, 0, 0), MOVE_SPEED),
      [DOWN]: new Command(DOWN, this.handleMovement.bind(this, 0, 1, 0), MOVE_SPEED),
      [AUTO_DOWN]: new Command(AUTO_DOWN, this.handleAutoDrop.bind(this)),
      [ROTATE_LEFT]: new Command(ROTATE_LEFT, this.handleMovement.bind(this, 0, 0, -1)),
      [ROTATE_RIGHT]: new Command(ROTATE_RIGHT, this.handleMovement.bind(this, 0, 0, 1)),
      [HARD_DROP]: new Command(HARD_DROP, this.board.hardDrop.bind(this)),
      ...mapArrayToObj(PLAYER_KEYS, (PKEY) => new Command(PKEY, this.usePowerUp.bind(this, PKEY))),
    }
  }
  /**
   * Executes movement command.
   * @param {number} key - Keypress identifier
   */
  command(key, upDown) {
    this.addLockDelay(key);
    this.resetAutoDown(key);

    if ((key in this.commands) && this.gameStatus) {
      if (!POWER_UP_KEY_CODES.has(key)) this.addToCommandQueue(key);

      const topic = upDown === 'down' ? ADD_COMMAND : CLEAR_COMMAND;
      this.pubSub.publish(topic, commands[key]);
    }

    // if game over and command queue isn't empty, send it
    if (!this.gameStatus && this.commandQueue.length > 0) {
      this.sendCommandQueue();
    }
  }

  handleMovement(xChange, yChange, rotation) {
    (yChange === 1) ? this.resetAutoDown() : this.addLockDelay();
    (rotation === 0)
      ? this.board.movePiece(xChange, yChange)
      : this.board.rotatePiece(rotation);
  }
  /**
   * Adds delay before Tetris piece is locked to board.
   * @param {number} key - Keypress identifier
   */
  addLockDelay() {
    const increment = this.getLockDelayIncrement();
    this.lockDelay = Math.min(increment * 4, this.lockDelay + increment);
  }

  /**
   * Increments lock delay.
   * @return {number} - Delay increment in milliseconds
   */
  getLockDelayIncrement() {
    const baseDelay = ANIMATION_SPEED[1];
    const currentDelay = this.getAnimationDelay();
    // max is baseDelay / 4, min is baseDelay / 8
    return ((baseDelay / currentDelay - 1) / 2 + 1) * currentDelay / 4;
  }

  /**
   * Resets the timer on auto-down movement.
   * @param {number} key - Keypress identifier
   */
  resetAutoDown(key) {
    this.interruptAutoDown = true;
  }

  /**
   * Adds command to command queue.
   * @param {number} key - Keypress identifier
   */
  addToCommandQueue(key) {
    if (key in COMMAND_QUEUE_MAP) {
      this.commandQueue.push(COMMAND_QUEUE_MAP[key]);
    }
  }

  /**
   * Sends current command queue to backend.
   */
  sendCommandQueue() {
    publish(SEND_MESSAGE, {
      type: EXECUTE_COMMANDS,
      data: this.commandQueue
    });
    this.commandQueue = [];
  }

  /**
   * Maps keypress id to player id and sends command queue
   * @param {number} player - keypress id
   */
  usePowerUp(player) {
    const playerIds = {
      [CONTROLS.PLAYER1]: this.playerId,
      [CONTROLS.PLAYER2]: this.players[0],
      [CONTROLS.PLAYER3]: this.players[1],
      [CONTROLS.PLAYER4]: this.players[2],
    }
    const id = playerIds[player];

    if (id) {
      this.addToCommandQueue(CONTROLS[`PLAYER${id}`]);
      this.sendCommandQueue();
      this.pubSub.publish(USE_POWER_UP);
    }
  }

  /**
   * Updates game score.
   * @param {number} points - number of points to add to game score
   */
  updateScore(points) {
    super.updateScore(points);

    publish(UPDATE_SCORE, {
      score: this.score,
    })
  }

  /**
   * Updates level, and number of lines remaining until next level.
   * @param {number} lines - number of lines cleared
   */
  updateLinesRemaining(lines) {
    super.updateLinesRemaining(lines);

    publish(UPDATE_SCORE, {
      level: this.level,
      lines: this.linesRemaining,
    })
  }

  /**
   * Ends the current game.
   * @param {number} id - id of player whose game is over
   */
  gameOver({ id }) {
    if (id === this.playerId) {
      this.unsubscribe();
      this.gameStatus = null;
    }
  }

  /**
   * Handles auto-down movement of current piece
   * @param {number} currTime - time in ms since game start
   */
  handleAutoDrop(currTime) {
    this.time.elapsed = currTime - this.time.start;

    const validNextMove = this.board.validMove(0, 1);

    // resets auto-movement time if interrupted
    if (this.interruptAutoDown && validNextMove) {
      this.time.start = currTime;
      this.interruptAutoDown = false;
    }

    // executes auto-movement if valid
    if (this.time.elapsed > this.getAutoDropDelay(validNextMove)) {
      this.time.start = currTime;
      this.command(CONTROLS.AUTO_DOWN);
      this.lockDelay = 0;
    }
  }
  /**
   * Calculates the total delay in milliseconds until the next auto-movement
   * @param {boolean} validNextMove - Whether or not the next row is blocked
   * @returns {number} - Total delay in milliseconds
   */
  getAutoDropDelay(validNextMove) {
    const lockDelay = validNextMove ? 0 : this.lockDelay;
    return this.getAnimationDelay() + lockDelay;
  }

  /**
   * Calculates the base delay in milliseconds until the next auto-movement
   * @returns {number} - Base delay in milliseconds
   */
  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }
}

module.exports = ClientGame;