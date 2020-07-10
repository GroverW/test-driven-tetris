class SubscriberBase {
  constructor(playerId, pubSub) {
    this.playerId = playerId;
    this.pubSub = pubSub;
    this.subscriptions = [];
  }

  mapSubscriptions(topics) {
    topics.forEach((topic) => this.addSubscription(topic))
  }

  addSubscription(topic) {
    this.subscriptions.push(this.pubSub.subscribe(topic, this[topic].bind(this)));
  }

  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

module.exports = SubscriberBase;