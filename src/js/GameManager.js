class GameManager {
  constructor() {
    this.players = [];
  }

  addPlayer(player) {
    if (!this.players.includes(player)) {
      this.players.push(player);
    }
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p !== player);
  }
}

module.exports = GameManager;