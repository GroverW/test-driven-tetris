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
   * @param {object} selectors.scoreSelector - game score selector
   * @param {object} selectors.levelSelector - game level selector
   * @param {object} selectors.linesSelector - game lines cleared selector
   * @param {object} selectors.playerSelector - player game container selector
   * @param {number} id - Id of player on backend
   */
  constructor(selectors, id) {
    this.id = id;
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.gameContainer = selectors.gameContainer;
    this.scoreSelector = selectors.scoreSelector;
    this.levelSelector = selectors.levelSelector;
    this.linesSelector = selectors.linesSelector;
    this.playerSelector = selectors.playerSelector;
    this.powerUpSelectors = selectors.powerUpSelectors;
    this.powerUps = [];
    this.players = [];
    this.powerUps = [];
    this.subscriptions = [
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
    if(id === this.id) return;
    // create container div
    let playerContainer = document.createElement('div');
    playerContainer.id = `p${id}`;

    let containerClass = 'item-large';

    // resize player 2 if they're the only other player
    if (this.players.length >= 1) {
      containerClass = 'item-small';
      this.players[0].selector.classList.replace('item-large', 'item-small');
    }

    playerContainer.classList.add(containerClass);

    // creates a new html canvas
    let playerCanvas = document.createElement('canvas');
    playerCanvas.id = `p${id}-board`;
    playerCanvas.classList.add('game-board')

    const playerCtx = playerCanvas.getContext('2d');

    playerContainer.appendChild(playerCanvas);
    this.gameContainer.appendChild(playerContainer);

    const playerDOM = getNewPlayerDOM(playerContainer, id);
    const player = getNewPlayer(playerCtx, getEmptyBoard(), id)

    // adds player to player list and gameView
    this.players.push(playerDOM);
    this.gameView.addPlayer(player);
  }

  /**
   * Removes additional player from game container
   * @param {number} id - id of player to remove
   */
  removePlayer(id) {
    if(id === this.id) return;

    const playerIdx = this.players.findIndex(p => p.id === id);
    
    if (playerIdx >= 0) {
      const playerSelector = this.players[playerIdx].selector;
      playerSelector.parentNode.removeChild(playerSelector);
      this.players.splice(playerIdx, 1);
    }
    
    if (this.players.length === 1) {
      this.players[0].selector.classList.replace('item-small', 'item-large');
    }
  }

  /**
   * Updates the current score, level, or lines cleared
   * @param {object} data - elements of scoreBoard to update
   * @param {number} [data.score] - game score
   * @param {number} [data.level] - game level
   * @param {number} [data.lines] - game lines cleared
   */
  updateScoreboard(data) {
    if('score' in data) this.scoreSelector.innerText = data.score;
    if('level' in data) this.levelSelector.innerText = data.level;
    if('lines' in data) this.linesSelector.innerText = data.lines;
  }

  /**
   * Adds a power up to the list, and sets the class on the DOM
   * @param {number} powerUp - power up id
   */
  addPowerUp(powerUp) {
    if(POWER_UPS.has(powerUp) && this.powerUps.length < MAX_POWER_UPS) {
      const nextIdx = this.powerUps.length;
      this.powerUps.push(powerUp)
      this.powerUpSelectors[nextIdx].classList.add(`powerUp${powerUp}`)
    }
  }

  /**
   * Removes the first power up from the list. Updates all classes.
   */
  usePowerUp() {
    let i = 0;
    while(i < this.powerUps.length - 1) {
      const curr = this.powerUps[i]; 
      const next = this.powerUps[i+1];
      this.powerUpSelectors[i].classList.replace(`powerUp${curr}`, `powerUp${next}`);
      i++;
    }
    const curr = this.powerUps[i];
    curr && this.powerUpSelectors[i].classList.remove(`powerUp${curr}`);
    this.powerUps.shift();
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
    if(data.id === this.id) {
      this.unsubscribe();
      this.gameView.drawBoard(this.gameView.ctx, data.board);
      this.addGameOverMessage(this.playerSelector, data.message);
      return;
    }

    const playerIdx = this.players.findIndex(p => p.id === data.id);

    if(playerIdx >= 0) {
      this.gameView.updatePlayer(data);
      this.addGameOverMessage(this.players[playerIdx].selector, data.message);
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