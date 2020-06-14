/**
 * Creates a new pubSub object
 */
const pubSub = () => ({
  subscribers: {},

  /**
   * Publishes data to a topic
   * @param {string} topic - topic to publish to
   * @param {*} data - data to publish to topic
   */
  publish(topic, data) {
    if (this.subscribers[topic] !== undefined) {
      this.subscribers[topic].forEach((obj) => obj.callback(data));
    };
  },

  /**
   * Adds subscriber to a specified topic
   * @param {string} topic - topic to subscribe to
   * @param {function} callback - function to call when data is published to topic
   * @returns {function} - function to call to unsubscribe from topic
   */
  subscribe(topic, callback) {
    const id = this.subscribers[topic]
      ? this.addSubscriber(topic, callback)
      : this.addTopic(topic, callback);

    const unsubscribe = () => {
      this.removeSubscriber(topic, id);
    };

    return unsubscribe;
  },

  /**
   * Adds a new topic
   * @param {string} topic - topic to add
   * @param {function} callback - initial callback to add to topic
   * @returns {number} - id of subscriber to be used when unsubscribing
   */
  addTopic(topic, callback) {
    const id = 0;
    this.subscribers[topic] = [{ id, callback }];

    return id;
  },

  /**
   * Adds subscriber to existing topic
   * @param {string} topic - topic to add subscriber to
   * @param {function} callback - function to call when publishing to topic
   * @returns {number} - id of subscriber to be used when unsubscribing
   */
  addSubscriber(topic, callback) {
    const id = this.subscribers[topic].length;
    this.subscribers[topic].push({ id, callback });

    return id;
  },

  /**
   * Removes subscriber from a specified topic
   * @param {string} topic - topic to remove subscriber from
   * @param {number} id - id of subscriber to remove
   */
  removeSubscriber(topic, id) {
    this.subscribers[topic] = this.subscribers[topic].filter((s) => s.id !== id);
  }
})


module.exports = pubSub;