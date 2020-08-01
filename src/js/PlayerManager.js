class PlayerManager {
  constructor() {
    this.playerList = [];
  }

  get first() {
    return this.playerList[0];
  }

  get list() {
    return this.playerList;
  }

  get count() {
    return this.playerList.length;
  }

  add(player) {
    if (this.playerList.includes(player)) return false;

    this.playerList.push(player);
    return true;
  }

  remove(player) {
    this.playerList = this.playerList.filter((p) => p !== player);
  }

  getById(id) {
    return this.playerList.find((p) => p.id === id);
  }
}

module.exports = PlayerManager;
