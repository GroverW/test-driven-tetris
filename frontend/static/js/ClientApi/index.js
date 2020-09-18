const { publishError, formatMessage } = require('frontend/helpers/utils');
const { CREATE_GAME, JOIN_GAME } = require('frontend/topics');

class ClientApi {
  constructor(ws) {
    this.ws = ws;
  }

  sendMessage(message) {
    try {
      this.ws.send(formatMessage(message));
    } catch (err) {
      publishError('Could not send message to backend.');
    }
  }

  createGame(gameType) {
    this.sendMessage({ type: CREATE_GAME, data: gameType });
  }

  joinGame(gameId) {
    this.sendMessage({ type: JOIN_GAME, data: gameId });
  }
}

module.exports = ClientApi;
