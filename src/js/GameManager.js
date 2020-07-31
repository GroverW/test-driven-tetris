const { GAME_TYPES } = require('common/helpers/constants');

class GameManager {
  constructor(gameType) {
    this.gameType = gameType;
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

  getTotalReady() {
    return this.players.filter((p) => p.readyToPlay).length;
  }

  checkStartConditions() {
    if (this.gameType === GAME_TYPES.MULTI) return this.checkMultiplayerStartConditions();
    if (this.gameType === GAME_TYPES.SINGLE) return this.checkSingleplayerStartConditions();

    return false;
  }

  checkMultiplayerStartConditions() {
    const totalReady = this.getTotalReady();
    const numPlayers = this.players.length;

    if (totalReady === numPlayers && numPlayers === 1) {
      this.sendError('Not enough players to start game.');
      return false;
    }

    if (totalReady < numPlayers) {
      return false;
    }

    return true;
  }

  checkSingleplayerStartConditions() {
    return this.getTotalReady() === this.players.length;
  }

  playerReady() {
    if (this.checkStartConditions()) {
      this.animateStart();
    }
  }

  animateStart() {

  }

  sendError() {

  }
}

module.exports = GameManager;
