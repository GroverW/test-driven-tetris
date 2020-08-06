const { subscribe } = require('frontend/helpers/pubSub');
const { MESSAGE_TIMEOUT } = require('frontend/constants');
const { ADD_MESSAGE, CLEAR_MESSAGE } = require('frontend/topics');

/**
 * Represents the flash messages displayed on screen
 */
class ClientMessage {
  /**
   * Sets the message selector and subscribes to pubSub topics
   * @param {object} messageSelector - DOM selector for message element
   */
  initialize(messageSelector) {
    this.message = messageSelector;
    this.subscriptions = [
      subscribe(ADD_MESSAGE, this.handleMessage.bind(this)),
      subscribe(CLEAR_MESSAGE, this.clearMessage.bind(this)),
    ];
  }

  /**
   * Adds message to message container
   * @param {string} type - type of message (error / notice)
   * @param {string} message - message text
   */
  addMessage(type, message) {
    this.message.innerText = message;

    this.message.classList = '';
    this.message.classList.add(type);
  }

  /**
   * Hides msesage container
   */
  clearMessage() {
    this.message.classList.add('hide');
  }

  /**
   * Adds message and then sets timeout to clear message
   * @param {string} type - type of message (error / notice)
   * @param {string} message - message text
   */
  handleMessage({ type, message }) {
    this.addMessage(type, message);

    setTimeout(this.clearMessage.bind(this), MESSAGE_TIMEOUT);
  }

  /**
   * Unsubscribes from all topics
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

const clientMessage = new ClientMessage();

module.exports = clientMessage;
