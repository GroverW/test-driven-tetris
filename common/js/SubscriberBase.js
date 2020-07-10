const { GAME_OVER, END_GAME } = require('common/helpers/commonTopics');

class SubscriberBase {
  constructor(playerId, pubSub) {
    this.playerId = playerId;
    this.pubSub = pubSub;
    this.subscriptions = [];
    this.mapSubscriptions([GAME_OVER, END_GAME])
  }

  mapSubscriptions(topics) {
    topics.forEach((topic) => this.addSubscription(topic))
  }

  addSubscription(topic) {
    this.subscriptions.push(this.pubSub.subscribe(topic, this[topic].bind(this)));
  }

  [GAME_OVER]({ id }) {
    if(this.playerId === id) {
      this.gameOverAction();
    }
  }

  [END_GAME]() {
    this.endGameAction();
  }

  gameOverAction() {

  }

  endGameAction() {
    
  }
  
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

module.exports = SubscriberBase;