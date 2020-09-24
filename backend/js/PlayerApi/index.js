const {
  getNewPlayer,
  getNullPlayer,
  createGame,
  getGameById,
} = require('backend/helpers/routeHelpers');
const {
  CREATE_GAME, JOIN_GAME, LEAVE_GAME, MSG_TYPE, PLAY, EXECUTE_COMMANDS,
} = require('backend/topics');

class PlayerApi {
  constructor(ws) {
    this.ws = ws;
    this.player = getNullPlayer();
  }

  [CREATE_GAME](type) {
    this.createPlayer();
    const gameId = createGame(type);

    if (!gameId) {
      this.player.sendFlash(MSG_TYPE.ERROR, 'Unable to create game.');
      return;
    }

    const gameRoom = getGameById(gameId);
    gameRoom.join(this.player);
  }

  [JOIN_GAME](gameId) {
    this.createPlayer();

    const gameRoom = getGameById(gameId);

    if (!gameRoom) {
      this.player.sendFlash(MSG_TYPE.ERROR, 'Game not found.');
      return;
    }

    gameRoom.join(this.player);
  }

  createPlayer() {
    this[LEAVE_GAME]();
    this.player = getNewPlayer(this.ws);
  }

  [LEAVE_GAME]() {
    this.player.leave();
  }

  [PLAY]() {
    this.player.startGame();
  }

  [EXECUTE_COMMANDS](commands) {
    this.player.execute(commands);
  }

  handleMessage(message) {
    const { type: action, data } = JSON.parse(message);

    if (this[action]) this[action](data);
  }
}

module.exports = PlayerApi;