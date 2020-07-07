const Game = require('common/js/Game');
const ClientBoard = require('./ClientBoard');
const Gravity = require('./Gravity');
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
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
  ADD_LOCK_DELAY,
  INTERRUPT_DELAY,
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
    publish(
      SET_AUTO_COMMAND,
      new Gravity(this.playerId, this.autoDrop.bind(this), this.validDrop.bind(this))
    );
    this.mapCommands();
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
    const { LEFT, RIGHT, DOWN, ROTATE_LEFT, ROTATE_RIGHT, HARD_DROP } = CONTROLS;

    this.commands = {
      [LEFT]: new Command(LEFT, this.handleMovement.bind(this, 0, -1, 0), MOVE_SPEED),
      [RIGHT]: new Command(RIGHT, this.handleMovement.bind(this, 0, 1, 0), MOVE_SPEED),
      [DOWN]: new Command(DOWN, this.handleMovement.bind(this, 0, 0, 1), MOVE_SPEED),
      [ROTATE_LEFT]: new Command(ROTATE_LEFT, this.handleMovement.bind(this, -1, 0, 0)),
      [ROTATE_RIGHT]: new Command(ROTATE_RIGHT, this.handleMovement.bind(this, 1, 0, 0)),
      [HARD_DROP]: new Command(HARD_DROP, this.board.hardDrop.bind(this)),
      ...mapArrayToObj(PLAYER_KEYS, (PKEY) => new Command(PKEY, this.usePowerUp.bind(this, PKEY))),
    };
  }
  /**
   * Executes movement command.
   * @param {number} key - Keypress identifier
   */
  command(key, upDown) {
    if ((key in this.commands) && this.gameStatus) {
      if (!POWER_UP_KEY_CODES.has(key)) this.addToCommandQueue(key);

      const topic = upDown === 'down' ? SET_COMMAND : CLEAR_COMMAND;
      this.pubSub.publish(topic, commands[key]);
    }
  }

  handleMovement(rotation, xChange, yChange, multiplier = undefined) {
    (yChange === 1) ? publish(INTERRUPT_DELAY) : publish(ADD_LOCK_DELAY);
    (rotation === 0)
      ? this.board.movePiece(xChange, yChange, multiplier)
      : this.board.rotatePiece(rotation);
  }

  autoDrop() {
    this.addToCommandQueue(AUTO_DOWN);
    this.handleMovement(0, 0, 1, 0);
  }

  validDrop() {
    return this.board.validMove(0, 1);
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
      if (this.commandQueue.length) this.sendCommandQueue();

      this.unsubscribe();
      this.gameStatus = null;
    }
  }
}

module.exports = ClientGame;