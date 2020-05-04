const Game = require('./game');

class Player {
  constructor(send, pubSub) {
    this.id;
    this.isHost = false;
    this._send = send;
    this.pubSub = pubSub;
    this.game = new Game(this.pubSub);
  }

  setId(id) {
    this.id = id;
    this.game.id = id;
    this.game.board.playerId = id;
  }

  leave() {
    this.pubSub.publish('leave', this);
  }

  startGame() {
    this.pubSub.publish('startGame', this);
  }
}

module.exports = Player