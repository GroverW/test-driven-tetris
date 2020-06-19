const { subscribe } = require('frontend/helpers/pubSub');
const { ERROR_TIMEOUT } = require('frontend/helpers/clientConstants');
const { ADD_ERROR, CLEAR_ERROR } = require('frontend/helpers/clientTopics');

class ClientError {
  constructor(errorSelector) {
    this.error = errorSelector;
    this.subscriptions = [
      subscribe(ADD_ERROR, this.handleError.bind(this)),
      subscribe(CLEAR_ERROR, this.clearError.bind(this)),
    ];
  }

  addError(message) {
    this.error.innerText = message;
    this.error.classList.remove('hide');
  }

  clearError() {
    this.error.classList.add('hide');
  }

  handleError(message) {
    this.addError(message);

    setTimeout(this.clearError.bind(this), ERROR_TIMEOUT);
  }

  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
  }
}

module.exports = ClientError;