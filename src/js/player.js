const Game = require('./game');
const pubSub = require('../helpers/pubSub');

class Player {
  constructor(send, pubSub) {
    this._send = send;
    this.gameServer;
    this.pubSub = pubSub;
    this.game = new Game(this.pubSub);
  }

  init(gameServer) {
    this.gameServer = gameServer;
  }

  gameOver() {
    this.gameServer.gameOver(this)
  }
}

module.exports = Player