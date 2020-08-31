const { GAME_TYPES, COUNTDOWN, SEED_PIECES } = require('backend/constants');
const {
  START_GAME, END_GAME, ADD_PIECES, MSG_TYPE,
} = require('backend/topics');
const { randomizedBuckets } = require('backend/helpers/utils');
const { handlePowerUp } = require('backend/helpers/powerUps');
const MessageManager = require('./MessageManager');

class GameManager {
  constructor(id, gameType, players) {
    this.id = id;
    this.gameStarted = false;
    this.gameType = gameType;
    this.players = players;
    this.msg = new MessageManager(gameType, players);
  }

  getTotalReady() {
    return this.players.list.filter((p) => p.readyToPlay).length;
  }

  checkStartConditions() {
    if (this.gameType === GAME_TYPES.MULTI) return this.checkMultiplayerStartConditions();
    if (this.gameType === GAME_TYPES.SINGLE) return this.checkSingleplayerStartConditions();

    return false;
  }

  checkMultiplayerStartConditions() {
    const totalReady = this.getTotalReady();
    const numPlayers = this.players.count;

    if (totalReady === numPlayers && numPlayers === 1) {
      this.players.first.sendFlash(MSG_TYPE.ERROR, 'Not enough players to start game.');
      return false;
    }

    if (totalReady < numPlayers) {
      return false;
    }

    return true;
  }

  checkSingleplayerStartConditions() {
    return this.getTotalReady() === this.players.count;
  }

  playerReady() {
    if (this.checkStartConditions()) {
      this.animateStart();
    } else {
      this.updatePlayersWaiting();
    }
  }

  updatePlayersWaiting() {
    if (!this.gameStarted) this.msg.sendWaitingMessage(this.getTotalReady(), this.id);
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
    this.gameStarted = true;
    this.getPieces();
    this.startPlayerGames();
    this.msg.sendAll({ type: START_GAME });
  }

  getPieces() {
    const pieces = randomizedBuckets(SEED_PIECES, 4);
    this.players.list.forEach((p) => p.addPieces(pieces));
    this.msg.sendAll({
      type: ADD_PIECES,
      data: pieces,
    });
  }

  startPlayerGames() {
    this.players.list.forEach((p) => p.game.start());
  }

  executePowerUp({ player1, player2, powerUp }) {
    const p1 = this.players.getById(player1);
    const p2 = this.players.getById(player2);

    if (p1 && p2) {
      const board1 = p1.game.board.grid;
      const board2 = p2.game.board.grid;

      const [result1, result2] = handlePowerUp(powerUp, board1, board2);

      if (result1) this.updatePlayerBoard(p1, result1);
      if (result2) this.updatePlayerBoard(p2, result2);
    }
  }

  updatePlayerBoard(player, grid) {
    const { id } = player;
    player.game.board.replaceBoard(grid);
    this.msg.sendPlayerUpdate({ id, grid });
  }

  getNextRanking(id = null) {
    return this.players.list.filter((p) => (p.game.gameStatus || p.id === id)).length;
  }

  gameOver({ id, grid }) {
    const ranking = this.getNextRanking(id);

    this.msg.sendGameOverMessage(id, grid, ranking);

    this.checkIfWinnerAndEndGame();
  }

  checkIfWinner() {
    if (!this.gameStarted) return false;

    const remaining = this.getNextRanking();

    if (remaining <= 1 && this.gameType === GAME_TYPES.MULTI) return true;

    if (remaining === 0 && this.gameType === GAME_TYPES.SINGLE) return true;

    return false;
  }

  endGame() {
    this.gameOverRemainingPlayers();

    this.msg.sendAll({ type: END_GAME, data: {} });
  }

  checkIfWinnerAndEndGame() {
    if (this.checkIfWinner()) this.endGame();
  }

  gameOverRemainingPlayers() {
    this.players.list.forEach((p) => p.gameOver());
  }
}

module.exports = GameManager;
