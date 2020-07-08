let subscribers = {};

/**
 * Publishes data to a specified topic
 * @param {string} topic - topic to publish to
 * @param {*} data - data to publish to topic
 */
const publish = (topic, data) => {
  if (subscribers[topic] !== undefined) {
    subscribers[topic].forEach((obj) => obj.callback(data));
  }
}

/**
 * Adds subscriber to a specified topic
 * @param {string} topic - topic to subscribe to
 * @param {function} callback - function to call when data is published to topic
 * @returns {function} - function to call to unsubscribe from topic
 */
const subscribe = (topic, callback) => {
  // console.log(topic, subscribers[topic])
  const id = subscribers[topic]
    ? addSubscriber(topic, callback)
    : addTopic(topic, callback);

  const unsubscribe = () => removeSubscriber(topic, id);

  return unsubscribe;
}

/**
 * Adds topic and initial subscriber to topic
 * @param {string} topic - topic to add
 * @param {callback} callback - initial callback to add to topic in subscribers
 * @returns {number} - id of subscriber
 */
const addTopic = (topic, callback) => {
  const id = 0;
  subscribers[topic] = [{ id, callback }];

  return id;
};

/**
 * Adds subscriber to existing topic
 * @param {string} topic - topic to add subscriber to
 * @param {callback} callback  - callback to add to topic
 * @returns {number} - id of subscriber
 */
const addSubscriber = (topic, callback) => {
  const id = subscribers[topic].reduce((max,sub) => Math.max(max, sub.id), 0) + 1;
  subscribers[topic].push({ id, callback });

  return id;
};

/**
 * Removes subscriber from specified topic
 * @param {string} topic - topic to remove subscriber from
 * @param {number} id - id of subscriber
 */
const removeSubscriber = (topic, id) => {
  subscribers[topic] = subscribers[topic].filter((s) => s.id !== id);
}

module.exports = {
  publish,
  subscribe
}