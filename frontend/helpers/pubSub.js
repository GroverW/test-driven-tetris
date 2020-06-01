let subscribers = {};

/**
 * Publishes data to a specified topic
 * @param {string} topic - topic to publish to
 * @param {*} data - data to publish to topic
 */
const publish = (topic, data) => {
  subscribers[topic] && subscribers[topic].forEach(callback => callback(data));
}

/**
 * Adds subscriber to a specified topic
 * @param {string} topic - topic to subscribe to
 * @param {function} callback - function to call when data is published to topic
 * @returns {function} - function to call to unsubscribe from topic
 */
const subscribe = (topic, callback) => {
  subscribers[topic]
    ? subscribers[topic].push(callback)
    : subscribers[topic] = [callback];

  const index = subscribers[topic].length - 1;
  const unsubscribe = () => { subscribers[topic].splice(index, 1) };

  return unsubscribe;
}

module.exports = {
  publish,
  subscribe
}