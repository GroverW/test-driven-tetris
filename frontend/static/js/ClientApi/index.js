const { publishError, formatMessage } = require('frontend/helpers/utils');
const { subscribe } = require('frontend/helpers/pubSub');
const { CREATE_GAME, JOIN_GAME, SEND_MESSAGE } = require('frontend/topics');

class ClientApi {
  constructor(ws) {
    this.ws = ws;
    this.unsubSendMessage = subscribe(SEND_MESSAGE, this.sendMessage.bind(this));
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

  unsubscribe() {
    this.unsubSendMessage();
  }
}

module.exports = ClientApi;
