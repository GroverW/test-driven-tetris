const {
  getNewPlayer,
  getNullPlayer,
  createGame,
  getGameById,
} = require('backend/helpers/routeHelpers');
const {
  CREATE_GAME, JOIN_GAME, MSG_TYPE, PLAY, EXECUTE_COMMANDS,
} = require('backend/topics');

class PlayerApi {
  constructor(ws) {
    this.ws = ws;
    this.player = getNullPlayer();
  }

  createGame(type) {
    this.createPlayer();
    const gameId = createGame(type);

    if (!gameId) {
      this.player.sendFlash(MSG_TYPE.ERROR, 'Unable to create game.');
      return;
    }

    const gameRoom = getGameById(gameId);
    gameRoom.join(this.player);
  }

  joinGame(gameId) {
    this.createPlayer();

    const gameRoom = getGameById(gameId);
    gameRoom.join(this.player);
  }

  createPlayer() {
    this.leaveCurrentGame();
    this.player = getNewPlayer(this.ws);
  }

  leaveCurrentGame() {
    this.player.leave();
  }

  handleMessage(message) {
    const { type, data } = JSON.parse(message);
    if (type === PLAY) this.player.startGame();
    else if (type === EXECUTE_COMMANDS) this.player.execute(data);
    else if (type === CREATE_GAME) this.createGame(data);
    else if (type === JOIN_GAME) this.joinGame(data);
  }
}

module.exports = PlayerApi;