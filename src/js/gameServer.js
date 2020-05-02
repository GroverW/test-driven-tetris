const { GAMES, MAX_PLAYERS } = require('../helpers/data');

class GameServer {
  constructor() {
    this.players = [];
  }

  static get(id) {
    if(!GAMES.has(id)) GAMES.set(id, new GameServer())

    return GAMES.get(id);
  }

  join(player) {
    if(this.players.length <= MAX_PLAYERS) {
      this.players.push(player);
      return true;
    }
    
    return false;
  }
}

module.exports = GameServer;