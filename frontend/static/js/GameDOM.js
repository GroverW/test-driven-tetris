const SubscriberBase = require('common/js/SubscriberBase');

const pubSub = require('frontend/helpers/pubSub');
const {
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
} = require('frontend/helpers/clientUtils');
const {
  createElement,
  addPowerUpTargetId,
} = require('frontend/helpers/DOMUtils');
const {
  MAX_POWER_UPS,
  POWER_UPS,
} = require('frontend/helpers/clientConstants');
const {
  PLAY,
  START_GAME,
  GAME_OVER,
  END_GAME,
  GAME_MESSAGE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_SCORE,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('frontend/helpers/clientTopics');
const GameView = require('./GameView');

/**
 * Represents a client-side DOM manager
 */
class GameDOM extends SubscriberBase {
  /**
   * @constructor
   * @param {object} selectors - object of DOM selectors
   * @param {object} selectors.playerCtx - player canvas context
   * @param {object} selectors.nexCtx - player next piece canvas context
   * @param {object} selectors.opponents - game container selector
   * @param {object} selectors.score - game score selector
   * @param {object} selectors.level - game level selector
   * @param {object} selectors.lines - game lines cleared selector
   * @param {object} selectors.player - player game container selector
   * @param {object[]} selectors.powerUps - list of power up selectors
   * @param {object} selectors.music - game music selector
   * @param {number} playerId - Id of player on backend
   */
  constructor(selectors, playerId) {
    super(playerId, pubSub);
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.opponents = selectors.opponents;
    this.score = selectors.score;
    this.level = selectors.level;
    this.lines = selectors.lines;
    this.player = selectors.player;
    this.message = selectors.message;
    this.powerUps = this.mapPowerUps(selectors.powerUps);
    this.players = [];
    this.music = selectors.music;
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
    this.clearMessage(this.message);
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
    const [canvas, ctx] = this.getNewPlayerCanvas(id);

    playerContainer.appendChild(canvas);

    return [ctx, playerContainer, powerUpTargetSelector, message];
  }

  /**
   * Creates a new html canvas for an additional player
   * @param {number} id - player id
   * @returns {object[]} - canvad DOM node and ctx
   */
  getNewPlayerCanvas(id) {
    const canvas = createElement('canvas', { id: `p${id}-board`, classList: 'game-board' });
    const ctx = canvas.getContext('2d');

    return [canvas, ctx];
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
    this.players.forEach((p, i) => p.powerUpId.innerText = i + 2);
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
   * Maps a list of DOM selectors to an array of objects
   * @param {object[]} selectors - list of DOM selectors
   * @returns {object[]|boolean} - list of objects containing DOM selector and type, otherwise false if empty
   */
  mapPowerUps(selectors) {
    return selectors
      ? selectors.map((node) => ({ node, type: null })).slice(0, MAX_POWER_UPS)
      : false;
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
      const next = a[i + 1];

      if (next !== undefined && next.type !== null) {
        p.node.classList.replace(`power-up${p.type}`, `power-up${next.type}`);
        p.type = next.type;
      } else {
        p.node.classList.remove(`power-up${p.type}`);
        p.type = null;
      }
    });
  }

  /**
   * Adds game over message and updates board for player whose game is over
   * @param {number} id - player id whose game is over
   * @param {array} board - player's ending game board
   * @param {object} message - game over message
   * @param {string} message.header - game over message header
   * @param {string[]} message.body - list of messages in body
   */
  [GAME_OVER]({ id, board, message }) {
    if (!message) return;

    if (id === this.playerId) {
      this.gameView.drawGrid(this.gameView.ctx, board);
      this.addMessage(this.message, message);
      this.music.pause();
      return;
    }

    const player = this.players.find((p) => p.id === id);

    if (player) {
      this.gameView.updatePlayer({ id, board });
      this.addMessage(player.message, message);
    }
  }

  /**
   * Adds messages to this player's DOM when GAME_MESSAGE topic is published to
   * @param {object} message - message header and body
   * @param {string} message.header - message header
   * @param {string[]} message.body - list of messages in body
   */
  [GAME_MESSAGE](message) {
    this.addMessage(this.message, message);
  }

  /**
   * Adds game over message for a specified player
   * @param {object} container - DOM selector for player container
   * @param {object} message - message to include
   * @param {string} message.header - message header
   * @param {string[]} message.body - list of messages in body
   */
  addMessage(container, message) {
    container.innerText = '';
    container.classList.remove('hide');

    const messageElementText = createElement('div', { container, classList: 'game-message-text' });
    createElement('h1', { container: messageElementText, text: message.header });

    message.body.forEach((line) => (
      createElement('p', { container: messageElementText, text: line })
    ));
  }

  /**
   * Hides any visible game messages on specified container
   * @param {object} container - DOM selector
   */
  clearMessage(container) {
    container.classList.add('hide');
  }

  /**
   * Unsubscribes gameDOM from all topics
   */
  endGameAction() {
    this.unsubscribe();
  }
}

module.exports = GameDOM;
