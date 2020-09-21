const { publishError, formatMessage } = require('frontend/helpers/utils');
const { publish, subscribe } = require('frontend/helpers/pubSub');
const { CREATE_GAME, JOIN_GAME, SEND_MESSAGE, ADD_PLAYER } = require('frontend/topics');
const GameInitializer = require('./GameInitializer');

class ClientApi {
  constructor(ws) {
    this.ws = ws;
    this.unsubSendMessage = subscribe(SEND_MESSAGE, this.sendMessage.bind(this));
    this.gameInitializer = new GameInitializer();
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

  handleMessage(message) {
    const { type, data } = JSON.parse(message);

    if (type === ADD_PLAYER && !this.gameInitializer.isGameInitialized()) {
      this.gameInitializer.newGame(data);
      return;
    }

    publish(type, data);
  }

  unsubscribe() {
    this.unsubSendMessage();
  }
}

module.exports = ClientApi;
