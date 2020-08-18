const SubscriberBase = require('common/js/SubscriberBase');

const pubSub = require('frontend/helpers/pubSub');

const {
  getEmptyBoard,
  getNextPieceBoard,
  getNewPlayer,
  getNewPlayerDOM,
} = require('frontend/helpers/utils');
const { POWER_UPS } = require('frontend/constants');
const {
  PLAY,
  START_GAME,
  GAME_OVER,
  END_GAME,
  GAME_MESSAGE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_SCORE,
  UPDATE_PLAYER,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('frontend/topics');
const {
  createElement, addPowerUpTargetId, addMessage, hideElement, getNewPlayerCanvas, mapPowerUps,
} = require('./DOMHelpers');
const GameView = require('./GameView');

/**
 * Represents a client-side DOM manager
 */
class GameDOM extends SubscriberBase {
  /**
   * @constructor
   * @param {object} playerCtx - player canvas context
   * @param {object} nexCtx - player next piece canvas context
   * @param {object} opponents - game container selector
   * @param {object} score - game score selector
   * @param {object} level - game level selector
   * @param {object} lines - game lines cleared selector
   * @param {object} player - player game container selector
   * @param {object} message - game message selector
   * @param {object[]} powerUps - list of power up selectors
   * @param {object} music - game music selector
   * @param {number} playerId - Id of player on backend
   */
  constructor() {
    super(pubSub);
  }

  initialize({
    playerCtx, nextCtx, opponents, score, level, lines, player, message, powerUps, music,
  }, playerId) {
    super.initialize(playerId);
    this.gameView = new GameView(playerCtx, getEmptyBoard(), nextCtx, getNextPieceBoard());
    this.opponents = opponents;
    this.score = score;
    this.level = level;
    this.lines = lines;
    this.player = player;
    this.message = message;
    this.powerUps = mapPowerUps(powerUps);
    this.players = [];
    this.music = music;
    this.mapSubscriptions([
      PLAY,
      START_GAME,
      GAME_OVER,
      END_GAME,
      ADD_PLAYER,
      REMOVE_PLAYER,
      UPDATE_SCORE,
      ADD_POWER_UP,
      USE_POWER_UP,
    ]);
  }

  /**
   * Subscribes user to game messages when ready
   */
  [PLAY]() {
    this.addSubscription(GAME_MESSAGE);
  }

  /**
   * Clears any game messages and starts music on game start
   */
  [START_GAME]() {
    this.music.play();
    hideElement(this.message);
  }

  /**
   * Adds additional player to the game container
   * @param {number} id - id of additional player
   */
  [ADD_PLAYER](id) {
    if (id === this.playerId) return;

    const [canvasCtx, ...DOMElements] = this.getNewPlayerContainer(id);

    const playerDOM = getNewPlayerDOM(id, ...DOMElements);
    const player = getNewPlayer(canvasCtx, getEmptyBoard(), id);

    // adds player to player list and gameView
    this.players.push(playerDOM);
    this.gameView.addPlayer(player);

    // resize player 2 if adding additional players
    this.resizePlayer2();
  }

  /**
   * Resizes player 2 to have a large container if they're the only
   * other player, or small if there are more than 2 players
   */
  resizePlayer2() {
    const numPlayers = this.players.length;
    const large = 'item-large';
    const small = 'item-small';
    const p = this.players[0];

    if (numPlayers > 1) p.node.classList.replace(large, small);
    else if (numPlayers === 1) p.node.classList.replace(small, large);
  }

  /**
   * Creates a new div for an additional player
   * @param {number} playerId - player id
   * @returns {object[]} - html node and canvas ctx
   */
  getNewPlayerContainer(playerId) {
    let classList = this.players.length > 0 ? 'item-small' : 'item-large';
    const id = `p${playerId}`;
    let container = this.opponents;
    const playerContainer = createElement('div', { id, container, classList });

    classList = 'game-message hide';
    container = playerContainer;

    const message = createElement('div', { container, classList });

    const powerUpTargetId = this.players.length + 2;
    const powerUpTargetSelector = addPowerUpTargetId(playerContainer, powerUpTargetId);

    // creates new html canvas
    const [canvas, ctx] = getNewPlayerCanvas(id);

    playerContainer.appendChild(canvas);

    return [ctx, playerContainer, powerUpTargetSelector, message];
  }

  /**
   * Removes additional player from game container
   * @param {number} id - id of player to remove
   */
  [REMOVE_PLAYER](id) {
    if (id === this.playerId) return;

    const player = this.players.find((p) => p.id === id);

    if (player) {
      player.node.parentNode.removeChild(player.node);
      this.players = this.players.filter((p) => p.id !== id);
    }

    this.resizePlayer2();
    this.updatePowerUpTargetIds();
  }

  /**
   * Updates the text on each player container to show the correct
   * key to use to target them with a power up
   */
  updatePowerUpTargetIds() {
    this.players.forEach((player, i) => {
      const updatedPlayer = player;
      updatedPlayer.powerUpId.innerText = i + 2;
    });
  }

  /**
   * Updates the current score, level, or lines cleared
   * @param {number} [score] - game score
   * @param {number} [level] - game level
   * @param {number} [lines] - game lines cleared
   */
  [UPDATE_SCORE]({ score, level, lines }) {
    if (score !== undefined) this.score.innerText = score;
    if (level !== undefined) this.level.innerText = level;
    if (lines !== undefined) this.lines.innerText = lines;
  }

  /**
   * Adds a power up to the list, and sets the class on the DOM
   * @param {number} powerUp - power up id
   */
  [ADD_POWER_UP](powerUp) {
    if (POWER_UPS.has(powerUp)) {
      const nextPowerUp = this.powerUps.find((p) => p.type === null);

      if (nextPowerUp) {
        nextPowerUp.type = powerUp;
        nextPowerUp.node.classList.add(`power-up${powerUp}`);
      }
    }
  }

  /**
   * Removes the first power up from the list. Updates all classes.
   */
  [USE_POWER_UP]() {
    this.powerUps.forEach((p, i, a) => {
      const updated = p;
      const next = a[i + 1];

      if (next !== undefined && next.type !== null) {
        updated.node.classList.replace(`power-up${updated.type}`, `power-up${next.type}`);
        updated.type = next.type;
      } else {
        updated.node.classList.remove(`power-up${updated.type}`);
        updated.type = null;
      }
    });
  }

  /**
   * Adds game over message and updates board for player whose game is over
   * @param {number} id - player id whose game is over
   * @param {number[][]} board - player's ending game board
   * @param {object} message - game over message
   * @param {string} message.header - game over message header
   * @param {string[]} message.body - list of messages in body
   */
  [GAME_OVER]({ id, grid, message }) {
    if (!message) return;

    if (id === this.playerId) {
      this.gameView[UPDATE_PLAYER]({ id, grid });
      addMessage(this.message, message);
      this.music.pause();
      return;
    }

    const player = this.players.find((p) => p.id === id);

    if (player) {
      this.gameView[UPDATE_PLAYER]({ id, grid });
      addMessage(player.message, message);
    }
  }

  /**
   * Adds messages to this player's DOM when GAME_MESSAGE topic is published to
   * @param {object} message - message header and body
   * @param {string} message.header - message header
   * @param {string[]} message.body - list of messages in body
   */
  [GAME_MESSAGE](message) {
    addMessage(this.message, message);
  }

  /**
   * Unsubscribes gameDOM from all topics
   */
  endGameAction() {
    this.unsubscribe();
  }
}

const gameDOM = new GameDOM();

module.exports = gameDOM;
