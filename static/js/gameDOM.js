const GameView = require('./gameView');
const { subscribe } = require('../../pubSub');

class GameDOM {
  constructor(selectors) {
    this.gameContainer = document.getElementById('game-container');
    this.gameView = new GameView(selectors.playerCtx, selectors.nextCtx);
    this.scoreSelector = selectors.scoreSelector;
    this.levelSelector = selectors.levelSelector;
    this.linesSelector = selectors.linesSelector;
    this.players = [];
    this.unsubAddP = subscribe('addPlayer', this.addPlayer.bind(this))
  }

  addPlayer(player) {

  }
}

module.exports = GameDOM;