const { GAME_TYPES, COUNTDOWN, SEED_PIECES } = require('backend/helpers/serverConstants');
const { START_GAME, ADD_PIECES } = require('backend/helpers/serverTopics');
const MessageManager = require('./MessageManager');
const { randomize } = require('backend/helpers/serverUtils');

class GameManager {
  constructor(gameType, pubSub) {
    this.gameType = gameType;
    this.pubSub = pubSub;
    this.players = [];
    this.msg = new MessageManager(gameType);
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
    let currInterval = COUNTDOWN.NUM_INTERVALS;

    const animate = () => setTimeout(() => {
      currInterval -= 1;

      if (currInterval > 0) {
        this.msg.sendGameMessage(currInterval);
        animate();
      } else if (currInterval === 0) {
        this.msg.sendGameMessage('Good Luck!');
        animate();
      } else {
        this.startGame();
      }
    }, COUNTDOWN.INTERVAL_LENGTH * (currInterval < COUNTDOWN.NUM_INTERVALS));

    animate();
  }

  startGame() {
    this.pubSub.publish(START_GAME);
    this.getPieces();
    this.startPlayerGames();
    this.msg.sendAll({ type: START_GAME });
    this.updateRankings();
  }

  getPieces() {
    const pieces = randomize(SEED_PIECES);
    this.players.forEach((p) => p.addPieces(pieces));
    this.msg.sendAll({
      type: ADD_PIECES,
      data: pieces,
    });
  }

  startPlayerGames() {
    this.players.forEach((p) => p.game.start());
  }

  updateRankings() {

  }

  sendError() {

  }
}

module.exports = GameManager;
