const { subscribe } = require('frontend/helpers/pubSub');

class ClientError {
  constructor(errorSelector) {
    this.error = errorSelector;
    this.subscriptions = [
      subscribe('addError', this.addError.bind(this)),
    ];
  }

  addError(message) {
    this.error.innerText = message;
    this.error.classList.toggle('hide');
  }

  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
  }
}

module.exports = ClientError;