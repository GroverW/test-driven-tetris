const { GAME_TYPES, COUNTDOWN, SEED_PIECES } = require('backend/helpers/serverConstants');
const { START_GAME, GAME_OVER, END_GAME, ADD_PIECES } = require('backend/helpers/serverTopics');
const { randomize } = require('backend/helpers/serverUtils');
const { handlePowerUp } = require('backend/helpers/powerUps');
const MessageManager = require('./MessageManager');

class GameManager {
  constructor(gameType) {
    this.gameStarted = false;
    this.gameType = gameType;
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

  getPlayerById(id) {
    return this.players.find((p) => p.id === id);
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
    this.gameStarted = true;
    this.getPieces();
    this.startPlayerGames();
    this.msg.sendAll({ type: START_GAME });
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

  executePowerUp({ player1, player2, powerUp }) {
    const p1 = this.getPlayerById(player1);
    const p2 = this.getPlayerById(player2);

    if (p1 && p2) {
      const board1 = p1.game.board.grid;
      const board2 = p2.game.board.grid;

      const [result1, result2] = handlePowerUp(powerUp, board1, board2);

      if (result1) this.updatePlayerBoard(p1, result1);
      if (result2) this.updatePlayerBoard(p2, result2);
    }
  }

  updatePlayerBoard(player, board) {
    const { id } = player;
    player.game.board.replaceBoard(board);
    this.msg.sendPlayerUpdate({ id, board });
  }

  getNextRanking() {
    return this.players.filter((p) => p.game.gameStatus).length;
  }

  gameOver({ id, board }) {
    const ranking = this.getNextRanking();

    this.msg.sendGameOverMessage(id, board, ranking);

    if (this.checkIfWinner()) this.endGame();
  }

  checkIfWinner() {
    if (!this.gameStarted) return false;

    const remaining = this.getNextRanking();

    if (remaining <= 1 && this.gameType === GAME_TYPES.MULTI) return true;

    if (remaining === 0 && this.gameType === GAME_TYPES.SINGLE) return true;

    return false;
  }

  endGame() {
    this.gameOverRemainingPlayers()

    this.msg.sendAll({ type: END_GAME, data: {} });
  }

  gameOverRemainingPlayers() {
    this.players.forEach((p) => {
      if (p.game.gameStatus) {
        const { id } = p;
        const board = p.game.board.grid;
        p.pubSub.publish(GAME_OVER, { id, board });
      }
    });
  }

  sendError() {

  }
}

module.exports = GameManager;
