const { GAMES, MAX_PLAYERS } = require('../helpers/data');

class GameServer {
  constructor() {
    this.players = new Set();
  }

  static get(id) {
    if(!GAMES.has(id)) GAMES.set(id, new GameServer())

    return GAMES.get(id);
  }

  join(player) {
    if(this.players.size < MAX_PLAYERS) {
      this.players.add(player);
      return true;
    }
    
    return false;
  }

  leave(player) {
    if(this.players.has(player)) {
      this.players.delete(player);
    }
  }
}

module.exports = GameServer;