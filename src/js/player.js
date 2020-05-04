const Game = require('./game');

class Player {
  constructor(send, pubSub) {
    this.id;
    this.isHost = false;
    this._send = send;
    this.pubSub = pubSub;
    this.game = new Game(this.pubSub, this.id);
    this.pubSub.subscribe('gameOver', this.gameOver.bind(this));
  }

  gameOver() {
    
  }

  leave() {
    this.pubSub.publish('leave', this);
  }

  startGame() {
    this.pubSub.publish('startGame', this);
  }
}

module.exports = Player