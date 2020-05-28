const ServerGame = require('./serverGame');

class Player {
  constructor(send, pubSub) {
    this.id;
    this.isHost = false;
    this._send = send;
    this.pubSub = pubSub;
    this.game = new ServerGame(this.pubSub);
  }

  setId(id) {
    this.id = id;
    this.game.playerId = id;
    this.game.board.playerId = id;
  }

  leave() {
    this.pubSub.publish('leave', this);
  }

  startGame() {
    (this.game.gameStatus !== null) && this.pubSub.publish('startGame', this);
  }
}

module.exports = Player