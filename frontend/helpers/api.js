const { subscribe } = require('./pubSub');
const { SEND_MESSAGE } = require('./clientTopics');

class Api {
  constructor(ws) {
    this.ws = ws;
    this.unsubSend = subscribe(SEND_MESSAGE, this.sendMessage.bind(this));
  }

  formatMessage(message) {
    return JSON.stringify({
      type: message.type,
      data: message.data
    });
  }

  sendMessage (message) {
    try {
      this.ws.send(this.formatMessage(message));
    }
    catch (err) {
      console.log(err);
    }
  };

  unsubscribe() {
    this.unsubSend();
  }
}


module.exports = Api