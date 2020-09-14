const {
  getNewPlayer,
  createGame,
  getGameById,
} = require('backend/helpers/routeHelpers');
const { MSG_TYPE } = require('backend/topics');

class PlayerApi {
  constructor(ws) {
    this.ws = ws;
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

  createPlayer() {
    this.player = getNewPlayer(this.ws);
  }
}

module.exports = PlayerApi;