const { publishError, formatMessage } = require('frontend/helpers/clientUtils');
const { subscribe } = require('./pubSub');
const { SEND_MESSAGE } = require('./clientTopics');

class Api {
  constructor(ws) {
    this.ws = ws;
    this.unsubSend = subscribe(SEND_MESSAGE, this.sendMessage.bind(this));
  }

  sendMessage(message) {
    try {
      this.ws.emit('message', message);
    } catch (err) {
      publishError('Could not send message to backend.');
    }
  }

  unsubscribe() {
    this.unsubSend();
  }
}

module.exports = Api;
