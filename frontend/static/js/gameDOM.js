const GameView = require('./gameView');
const { subscribe } = require('frontend/helpers/pubSub');
const {
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
} = require('frontend/helpers/clientUtils');
const {
  MAX_POWER_UPS,
  POWER_UPS,
} = require('frontend/helpers/clientConstants');

/**
 * Represents a client-side DOM manager
 */
class GameDOM {
  /**
   * @constructor
   * @param {object} selectors - object of DOM selectors
   * @param {object} selectors.playerCtx - player canvas context
   * @param {object} selectors.nexCtx - player next piece canvas context
   * @param {object} selectors.gameContainer - game container selector
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
    this.gameContainer = selectors.gameContainer;
    this.score = selectors.score;
    this.level = selectors.level;
    this.lines = selectors.lines;
    this.player = selectors.player;
    this.powerUps = this.mapPowerUps(selectors.powerUps);
    this.players = [];
    this.music = selectors.music;
    this.subscriptions = [
      subscribe('startGame', selectors.music.play.bind(selectors.music)),
      subscribe('addPlayer', this.addPlayer.bind(this)),
      subscribe('removePlayer', this.removePlayer.bind(this)),
      subscribe('updateScore', this.updateScoreboard.bind(this)),
      subscribe('addPowerUp', this.addPowerUp.bind(this)),
      subscribe('usePowerUp', this.usePowerUp.bind(this)),
    ];
  }

  /**
   * Adds additional player to the game container
   * @param {number} id - id of additional player
   */
  addPlayer(id) {
    if (id === this.playerId) return;

    const [playerContainer, playerCtx] = this.getNewPlayerContainer(id);
    this.gameContainer.appendChild(playerContainer);

    const playerDOM = getNewPlayerDOM(playerContainer, id);
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
    let container = document.createElement('div');
    container.id = `p${id}`;
    const sizeClass = this.players.length > 0 ? 'item-small' : 'item-large';
    container.classList.add(sizeClass);

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
    let canvas = document.createElement('canvas');
    canvas.id = `p${id}-board`;
    canvas.classList.add('game-board');
    const ctx = canvas.getContext('2d');

    return [canvas, ctx];
  }

  /**
   * Removes additional player from game container
   * @param {number} id - id of player to remove
   */
  removePlayer(id) {
    if (id === this.playerId) return;

    const player = this.players.find(p => p.id === id);

    if (player) {
      player.node.parentNode.removeChild(player.node);
      this.players = this.players.filter(p => p.id !== id);
    }

    this.resizePlayer2();
  }

  /**
   * Updates the current score, level, or lines cleared
   * @param {object} data - elements of scoreBoard to update
   * @param {number} [data.score] - game score
   * @param {number} [data.level] - game level
   * @param {number} [data.lines] - game lines cleared
   */
  updateScoreboard(data) {
    if ('score' in data) this.score.innerText = data.score;
    if ('level' in data) this.level.innerText = data.level;
    if ('lines' in data) this.lines.innerText = data.lines;
  }

  /**
   * Maps a list of DOM selectors to an array of objects
   * @param {object[]} selectors - list of DOM selectors
   * @returns {object[]} - list of objects containing DOM selector and type
   */
  mapPowerUps(selectors) {
    return selectors
      ? selectors.map(node => ({ node, type: null })).slice(0, MAX_POWER_UPS)
      : false;
  }

  /**
   * Adds a power up to the list, and sets the class on the DOM
   * @param {number} powerUp - power up id
   */
  addPowerUp(powerUp) {
    if (POWER_UPS.has(powerUp)) {
      let nextPowerUp = this.powerUps.find(p => p.type === null);

      if (nextPowerUp) {
        nextPowerUp.type = powerUp;
        nextPowerUp.node.classList.add(`powerUp${powerUp}`)
      }
    }
  }

  /**
   * Removes the first power up from the list. Updates all classes.
   */
  usePowerUp() {
    this.powerUps.forEach((p, i, a) => {
      const next = a[i + 1];

      if (next && next.type !== null) {
        p.node.classList.replace(`powerUp${p.type}`, `powerUp${next.type}`);
        p.type = next.type;
      } else {
        p.node.classList.remove(`powerUp${p.type}`);
        p.type = null;
      }
    });
  }

  /**
   * Adds game over message and updates board for player whose game is over
   * @param {object} data - data used to create game over message
   * @param {number} data.id - player id whose game is over
   * @param {array} data.board - player's ending game board
   * @param {object} data.message - game over message
   * @param {string} data.message.header - game over message header
   * @param {string[]} data.message.body - list of messages in body
   */
  gameOver(data) {
    if (data.id === this.playerId) {
      this.unsubscribe();
      this.gameView.drawBoard(this.gameView.ctx, data.board);
      this.addGameOverMessage(this.player, data.message);
      this.music.pause();
      return;
    }

    const player = this.players.find(p => p.id === data.id);

    if (player) {
      this.gameView.updatePlayer(data);
      this.addGameOverMessage(player.node, data.message);
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
    let gameOverMessage = document.createElement('div');
    gameOverMessage.classList.add('game-over');

    let gameOverMessageText = document.createElement('div');
    gameOverMessageText.classList.add('game-over-message');

    let messageHeader = document.createElement('h1');
    messageHeader.innerText = message.header;
    gameOverMessageText.appendChild(messageHeader);

    message.body.forEach(line => {
      let newLine = document.createElement('p');
      newLine.innerText = line;
      gameOverMessageText.appendChild(newLine);
    })

    gameOverMessage.appendChild(gameOverMessageText);
    container.appendChild(gameOverMessage);
  }

  /**
   * Unsubscribes gameDOM from all topics
   */
  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
    this.gameView.unsubscribe();
  }
}

module.exports = GameDOM;