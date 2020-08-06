const { publishError, formatMessage } = require('frontend/helpers/utils');
const { SEND_MESSAGE } = require('frontend/topics');
const { subscribe } = require('./pubSub');

class Api {
  constructor(ws) {
    this.ws = ws;
    this.unsubSend = subscribe(SEND_MESSAGE, this.sendMessage.bind(this));
  }

  sendMessage(message) {
    try {
      this.ws.send(formatMessage(message));
    } catch (err) {
      publishError('Could not send message to backend.');
    }
  }

  unsubscribe() {
    this.unsubSend();
  }
}

module.exports = Api;
