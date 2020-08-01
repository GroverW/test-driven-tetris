const PlayerManager = require('backend/js/PlayerManager');
const GameManager = require('backend/js/GameManager');

class GameRoom {
  constructor(gameType) {
    this.gameType = gameType;
    this.players = new PlayerManager();
    this.manager = new GameManager(gameType, this.players);
  }

  roomAvailable() {
    return true;
  }
}

module.exports = GameRoom;