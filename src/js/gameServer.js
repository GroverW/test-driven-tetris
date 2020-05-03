const { GAMES, MAX_PLAYERS } = require('../helpers/data');

class GameServer {
  constructor() {
    this.players = new Set();
    this.gameStarted = false;
    this.nextRanking;
  }

  static get(id) {
    if(!GAMES.has(id)) GAMES.set(id, new GameServer())

    return GAMES.get(id);
  }

  join(player) {
    if(this.players.size < MAX_PLAYERS && !this.gameStarted) {
      this.players.add(player);
      player.init(this);
      
      this.sendAllExcept(player, {
        message: 'addPlayer',
        data: player.id
      });
      
      return true;
    }
    
    return false;
  }

  leave(player) {
    if(this.players.has(player)) {
      this.players.delete(player);

      this.sendAllExcept(player, {
        message: 'removePlayer',
        data: player.id
      });

      return true;
    }

    return false;
  }

  sendAll(data) {
    for(let player of this.players) {
      player._send(JSON.stringify(data));
    }
  }

  sendAllExcept(exceptPlayer, data) {
    for(let player of this.players) {
      (player !== exceptPlayer) && player._send(JSON.stringify(data));
    }
  }

  sendTo(player, data) {
    player._send(JSON.stringify(data));
  }

  startGame() {
    this.gameStarted = true;
    this.sendAll({
      message: 'startGame',
    })
    this.nextRanking = this.players.size;
  }

  gameOver(player) {
    this.sendAllExcept(player, {
      message: 'playerGameOver',
      data: {
        id: player.id,
        ranking: this.nextRanking
      }
    });

    this.sendTo(player, {
      message: 'gameOver',
      data: this.nextRanking
    });

    this.nextRanking--;
  }
}

module.exports = GameServer;