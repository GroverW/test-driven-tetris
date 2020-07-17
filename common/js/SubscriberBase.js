const { GAME_OVER, END_GAME } = require('common/helpers/commonTopics');

/**
 * Represents a subscriber to publish / subscribe messages
 */
class SubscriberBase {
  /**
   * Creates a new base subscriber
   * @constructor
   * @param {object} pubSub - publish / subscribe object
   * @param {number} [playerId] - id of player linking backend to frontend
   */
  constructor(pubSub, playerId = false) {
    this.pubSub = pubSub;
    this.subscriptions = [];
    if (playerId !== false) this.initialize(playerId);
  }

  initialize(playerId) {
    this.playerId = playerId;
    this.mapSubscriptions([GAME_OVER, END_GAME]);
  }

  /**
   * Adds subscriptions to specified topics
   * @param {string[]} topics - list of topics to subscribe to
   */
  mapSubscriptions(topics) {
    topics.forEach((topic) => this.addSubscription(topic));
  }

  /**
   * Adds subscription to specified topic
   * @param {string} topic - topic to subscribe to
   */
  addSubscription(topic) {
    this.subscriptions.push(this.pubSub.subscribe(topic, this[topic].bind(this)));
  }

  /**
   * Determines action to take when GAME_OVER topic is published
   * @param {number} id - id of player whose game is over
   */
  [GAME_OVER]({ id }) {
    if (this.playerId === id) {
      this.gameOverAction();
    }
  }

  /**
   * Determines action to take when END_GAME topic is published
   */
  [END_GAME]() {
    this.endGameAction();
  }

  /**
   * Action to take on game over. Implemented by sub-classes
   */
  gameOverAction() {

  }

  /**
   * Action to take on end game. Implemented by sub-classes
   */
  endGameAction() {

  }

  /**
   * Unsubscribes from all topics
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

module.exports = SubscriberBase;
