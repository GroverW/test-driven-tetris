const { GAMES } = require('../helpers/data');

class Player {
  constructor(send) {
    this.send = send;
    this.gameServer;
  }

  gameOver() {
    this.gameServer.gameOver(this)
  }
}

module.exports = Player