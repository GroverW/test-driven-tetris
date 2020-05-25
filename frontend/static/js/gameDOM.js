const GameView = require('./gameView');
const { subscribe } = require('../../helpers/pubSub');
const {
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
} = require('../../helpers/utils');

class GameDOM {
  constructor(selectors, id) {
    this.id = id;
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.gameContainer = selectors.gameContainer;
    this.scoreSelector = selectors.scoreSelector;
    this.levelSelector = selectors.levelSelector;
    this.linesSelector = selectors.linesSelector;
    this.playerSelector = selectors.playerSelector;
    this.players = [];
    this.subscriptions = [
      subscribe('addPlayer', this.addPlayer.bind(this)),
      subscribe('removePlayer', this.removePlayer.bind(this)),
      subscribe('updateScore', this.updateScoreboard.bind(this)),
    ];
  }

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

  updateScoreboard(data) {
    if('score' in data) this.scoreSelector.innerText = data.score;
    if('level' in data) this.levelSelector.innerText = data.level;
    if('lines' in data) this.linesSelector.innerText = data.lines;
  }

  gameOver(data) {
    if(data.id === this.id) {
      this.unsubscribe();
      this.gameView.drawBoard(this.gameView.ctx, data.board);
      this.addGameOverMessage(this.playerSelector, data.message);
      return;
    }

    const playerIdx = this.players.findIndex(p => p.id = data.id);

    if(playerIdx >= 0) {
      this.gameView.updatePlayer(data);
      this.addGameOverMessage(this.players[playerIdx].selector, data.message);
    }
  }

  addGameOverMessage(container, messages) {
    let gameOverMessage = document.createElement('div');
    gameOverMessage.classList.add('game-over');
    
    let gameOverMessageText = document.createElement('div');
    gameOverMessageText.classList.add('game-over-message');

    let messageLine1 = document.createElement('h1');
    messageLine1.innerText = `Game Over!`;
    gameOverMessageText.appendChild(messageLine1);

    messages.forEach(msg => {
      let newMsg = document.createElement('p');
      newMsg.innerText = msg;
      gameOverMessageText.appendChild(newMsg);
    })

    gameOverMessage.appendChild(gameOverMessageText);
    container.appendChild(gameOverMessage);
  }

  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
    this.gameView.unsubscribe();
  }
}

module.exports = GameDOM;