const { subscribe } = require('frontend/helpers/pubSub');
const { MESSAGE_TIMEOUT } = require('frontend/helpers/clientConstants');
const { ADD_MESSAGE, CLEAR_MESSAGE } = require('frontend/helpers/clientTopics');

class ClientMessage {
  initialize(messageSelector) {
    this.message = messageSelector;
    this.subscriptions = [
      subscribe(ADD_MESSAGE, this.handleMessage.bind(this)),
      subscribe(CLEAR_MESSAGE, this.clearMessage.bind(this)),
    ];
  }

  addMessage(type, message) {
    this.message.innerText = message;

    this.message.classList = '';
    this.message.classList.add(type);
  }

  clearMessage() {
    this.message.classList.add('hide');
  }

  handleMessage({ type, message }) {
    this.addMessage(type, message);

    setTimeout(this.clearMessage.bind(this), MESSAGE_TIMEOUT);
  }

  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

const clientMessage = new ClientMessage();

module.exports = clientMessage;
