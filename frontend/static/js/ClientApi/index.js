const { publishError, formatMessage } = require('frontend/helpers/utils');

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
}

module.exports = ClientApi;
