const Game = require('common/js/Game');
const ClientBoard = require('./ClientBoard');
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
    this.animationId;
    this.toggledKey = false;
    this.moveTime = { start: 0, elapsed: 0 };
    this.moveDelayIdx = 0;
    this.lockDelay = 0;
    this.interruptAutoDown = false;
    this.commandQueue = [];
    this.subscriptions.push(
      subscribe(START_GAME, this.start.bind(this)),
      subscribe(BOARD_CHANGE, this.sendCommandQueue.bind(this)),
      subscribe(UPDATE_PLAYER, this.replaceBoard.bind(this)),
      subscribe(ADD_PLAYER, this.addPlayer.bind(this)),
      subscribe(REMOVE_PLAYER, this.removePlayer.bind(this)),
    );
  }

  /**
   * Client-side implentation of start method.
   */
  start() {
    if (super.start()) {
      this.animate();

      publish(DRAW, {
        board: this.board.grid,
        piece: this.board.piece,
        nextPiece: this.board.nextPiece,
      });

      publish(UPDATE_SCORE, {
        score: this.score,
        level: this.level,
        lines: this.lines
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
   * @param {numbere} id - player id
   */
  removePlayer(id) {
    this.players = this.players.filter((pId) => pId !== id);
  }

  /**
   * Replaces the current board with a new one
   * @param {object} data - id of player, board to update
   * @param {number} data.id - id of player
   * @param {array} data.board - board to update
   */
  replaceBoard(data) {
    if (data.id === this.playerId) this.board.replaceBoard(data.board);
  }

  /**
   * Executes movement command.
   * @param {number} key - Keypress identifier
   */
  command(key) {
    const commands = {
      [CONTROLS.LEFT]: () => this.board.movePiece(-1, 0),
      [CONTROLS.RIGHT]: () => this.board.movePiece(1, 0),
      [CONTROLS.DOWN]: () => this.board.movePiece(0, 1),
      [CONTROLS.AUTO_DOWN]: () => this.board.movePiece(0, 1, 0),
      [CONTROLS.ROTATE_LEFT]: () => this.board.rotatePiece(-1),
      [CONTROLS.ROTATE_RIGHT]: () => this.board.rotatePiece(1),
      [CONTROLS.HARD_DROP]: () => this.board.hardDrop(),
      ...mapArrayToObj(PLAYER_KEYS, () => () => this.usePowerUp(key)),
    }

    this.addLockDelay(key);
    this.resetAutoDown(key);

    if ((key in commands) && this.gameStatus) {
      if (!POWER_UP_KEY_CODES.has(key)) this.addToCommandQueue(key);
      commands[key]();
    }

    // if game over and command queue isn't empty, send it
    if (!this.gameStatus && this.commandQueue.length > 0) {
      this.sendCommandQueue();
    }
  }

  /**
   * Toggles horizontal or vertical movement, otherwise executes command.
   * @param {number} key - Keypress identifier
   * @param {string} upDown - Whether key was pressed or released
   */
  toggleMove(key, upDown) {
    const toggleCommands = new Set([
      CONTROLS.LEFT,
      CONTROLS.RIGHT,
      CONTROLS.DOWN,
    ]);

    if (!toggleCommands.has(key) && upDown === 'down') this.command(key);
    else if (upDown === 'down') this.toggledKey = key;
    else if (this.toggledKey === key && upDown === 'up') this.toggledKey = false;
  }

  /**
   * Adds delay before Tetris piece is locked to board.
   * @param {number} key - Keypress identifier
   */
  addLockDelay(key) {
    const validKeys = new Set([
      CONTROLS.LEFT,
      CONTROLS.RIGHT,
      CONTROLS.ROTATE_LEFT,
      CONTROLS.ROTATE_RIGHT,
    ])

    if (validKeys.has(key)) {
      const increment = this.getLockDelayIncrement();
      this.lockDelay = Math.min(increment * 4, this.lockDelay + increment);
    }
  }

  /**
   * Increments lock delay.
   * @return {number} - Delay increment in milliseconds
   */
  getLockDelayIncrement() {
    const baseDelay = ANIMATION_SPEED[1];
    const currentDelay = this.getAnimationDelay();
    // max is baseDelay / 4, min is baseDelay / 8
    return ((baseDelay / currentDelay - 1) / 2 + 1) * currentDelay / 4
  }

  /**
   * Resets the timer on auto-down movement.
   * @param {number} key - Keypress identifier
   */
  resetAutoDown(key) {
    if (key === CONTROLS.DOWN) this.interruptAutoDown = true;
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
      type: 'executeCommands',
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
      lines: this.lines
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
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * Unsubscribes from all pubSub topics.
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  /**
   * Handles Game animation actions
   * @param {number} currTime - Time elapsed since start of game in milliseconds
   */
  animate(currTime = 0) {
    this.handleAutoDrop(currTime);

    this.handleToggledMovement(currTime);

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

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

  handleToggledMovement(currTime) {
    this.moveTime.elapsed = currTime - this.moveTime.start;

    // executes movement of toggled key
    if (this.toggledKey) {
      if (this.moveTime.elapsed > MOVE_SPEED[this.moveDelayIdx]) {
        this.moveTime.start = currTime;
        this.command(this.toggledKey);
        this.moveDelayIdx = Math.min(this.moveDelayIdx + 1, MOVE_SPEED.length - 1);
      }
    } else {
      this.moveDelayIdx = 0;
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