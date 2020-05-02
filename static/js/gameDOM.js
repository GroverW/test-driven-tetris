const GameView = require('./gameView');
const { subscribe } = require('../../pubSub');
const {
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
} = require('../../helpers/utils');

class GameDOM {
  constructor(selectors) {
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.gameContainer = selectors.gameContainer;
    this.scoreSelector = selectors.scoreSelector;
    this.levelSelector = selectors.levelSelector;
    this.linesSelector = selectors.linesSelector;
    this.players = [];
    this.unsubAddP = subscribe('addPlayer', this.addPlayer.bind(this));
    this.unsubRemoveP = subscribe('removePlayer', this.removePlayer.bind(this));
    this.unsubScore = subscribe('updateScore', this.updateScoreboard.bind(this));
  }

  addPlayer(id) {
    // create container div
    let playerContainer = document.createElement('div');
    playerContainer.id = `p${id}`;

    let containerClass = 'item-large';

    // resize player 2 if they're the only other player
    if (this.players.length === 1) {
      containerClass = 'item-small';
      this.players[0].selector.classList.replace('item-large', 'item-small');
    }

    playerContainer.classList.add(containerClass);

    let playerCanvas = document.createElement('canvas');
    playerCanvas.id = `p${id}-board`;
    playerCanvas.classList.add('game-board')

    const playerCtx = playerCanvas.getContext('2d');

    playerContainer.appendChild(playerCanvas);
    this.gameContainer.appendChild(playerContainer);

    const playerDOM = getNewPlayerDOM(playerContainer, id);
    const player = getNewPlayer(playerCtx, getEmptyBoard(), id)

    this.players.push(playerDOM);
    this.gameView.addPlayer(player);
  }

  removePlayer(id) {
    const playerIdx = this.players.findIndex(p => p.id === id);
    
    if (playerIdx >= 0) {
      this.players[playerIdx].selector.parentNode.removeChild();
      this.players.splice(playerIdx, 1);
    }
    
    if (this.players.length === 1) {
      this.players[0].selector.classList.replace('item-small', 'item-large');
    }
  }

  updateScoreboard(data) {
    if('score' in data) this.scoreSelector.innerText = data.score;
    if('level' in data) this.levelSelector.innerText = data.level;
    if('lines' in data) this.linesSelector.innerText = data.lines;
  }
}

module.exports = GameDOM;