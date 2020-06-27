const GameView = require('./GameView');
const { subscribe } = require('frontend/helpers/pubSub');
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
  START_GAME,
  GAME_OVER,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_SCORE,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('frontend/helpers/clientTopics');

/**
 * Represents a client-side DOM manager
 */
class GameDOM {
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
    this.playerId = playerId;
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.opponents = selectors.opponents;
    this.score = selectors.score;
    this.level = selectors.level;
    this.lines = selectors.lines;
    this.player = selectors.player;
    this.powerUps = this.mapPowerUps(selectors.powerUps);
    this.players = [];
    this.music = selectors.music;
    this.subscriptions = [
      subscribe(START_GAME, selectors.music.play.bind(selectors.music)),
      subscribe(GAME_OVER, this.gameOver.bind(this)),
      subscribe(ADD_PLAYER, this.addPlayer.bind(this)),
      subscribe(REMOVE_PLAYER, this.removePlayer.bind(this)),
      subscribe(UPDATE_SCORE, this.updateScoreboard.bind(this)),
      subscribe(ADD_POWER_UP, this.addPowerUp.bind(this)),
      subscribe(USE_POWER_UP, this.usePowerUp.bind(this)),
    ];
  }

  /**
   * Adds additional player to the game container
   * @param {number} id - id of additional player
   */
  addPlayer(id) {
    if (id === this.playerId) return;

    const [playerContainer, playerCtx] = this.getNewPlayerContainer(id);
    this.opponents.appendChild(playerContainer);

    const powerUpTargetId = this.players.length + 2;
    const powerUpTargetSelector = addPowerUpTargetId(playerContainer, powerUpTargetId)
    const playerDOM = getNewPlayerDOM(playerContainer, id, powerUpTargetSelector);
    const player = getNewPlayer(playerCtx, getEmptyBoard(), id)

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
    let p = this.players[0];

    if (numPlayers > 1) p.node.classList.replace(large, small);
    else if (numPlayers === 1) p.node.classList.replace(small, large);
  }

  /**
   * Creates a new div for an additional player
   * @param {number} id - player id
   * @returns {object[]} - html node and canvas ctx
   */
  getNewPlayerContainer(id) {
    const classList = this.players.length > 0 ? 'item-small' : 'item-large';
    let container = createElement('div', { id: `p${id}`, classList });

    // creates new html canvas
    const [canvas, ctx] = this.getNewPlayerCanvas(id);

    container.appendChild(canvas);

    return [container, ctx];
  }

  /**
   * Creates a new html canvas for an additional player
   * @param {number} id - player id
   * @returns {object[]} - canvad DOM node and ctx
   */
  getNewPlayerCanvas(id) {
    let canvas = createElement('canvas', { id: `p${id}-board`, classList: 'game-board' });
    const ctx = canvas.getContext('2d');

    return [canvas, ctx];
  }

  /**
   * Removes additional player from game container
   * @param {number} id - id of player to remove
   */
  removePlayer(id) {
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
  updateScoreboard({ score, level, lines }) {
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
  addPowerUp(powerUp) {
    if (POWER_UPS.has(powerUp)) {
      let nextPowerUp = this.powerUps.find((p) => p.type === null);

      if (nextPowerUp) {
        nextPowerUp.type = powerUp;
        nextPowerUp.node.classList.add(`power-up${powerUp}`)
      }
    }
  }

  /**
   * Removes the first power up from the list. Updates all classes.
   */
  usePowerUp() {
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
  gameOver({ id, board, message }) {
    if (!message) return;

    if (id === this.playerId) {
      this.unsubscribe();
      this.gameView.drawGrid(this.gameView.ctx, board);
      this.addGameOverMessage(this.player, message);
      this.music.pause();
      return;
    }

    const player = this.players.find((p) => p.id === id);

    if (player) {
      this.gameView.updatePlayer({ id, board });
      this.addGameOverMessage(player.node, message);
    }
  }

  /**
   * Adds game over message for a specified player
   * @param {object} container - DOM selector for player container
   * @param {object} message - message to include
   * @param {string} message.header - message header
   * @param {string[]} message.body - list of messages in body
   */
  addGameOverMessage(container, message) {
    let gameOverMessage = createElement('div', { classList: 'game-over' });
    let gameOverMessageText = createElement('div', { classList: 'game-over-message' });
    createElement('h1', { container: gameOverMessageText, text: message.header });

    message.body.forEach((line) => (
      createElement('p', { container: gameOverMessageText, text: line })
    ));

    gameOverMessage.appendChild(gameOverMessageText);
    container.appendChild(gameOverMessage);
  }

  /**
   * Unsubscribes gameDOM from all topics
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
    this.gameView.unsubscribe();
  }
}

module.exports = GameDOM;