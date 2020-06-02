let subscribers = {};

/**
 * Publishes data to a specified topic
 * @param {string} topic - topic to publish to
 * @param {*} data - data to publish to topic
 */
const publish = (topic, data) => {
  subscribers[topic] && subscribers[topic].forEach(obj => obj.callback(data));
}

/**
 * Adds subscriber to a specified topic
 * @param {string} topic - topic to subscribe to
 * @param {function} callback - function to call when data is published to topic
 * @returns {function} - function to call to unsubscribe from topic
 */
const subscribe = (topic, callback) => {
  const id = subscribers[topic]
    ? addSubscriber(topic, callback)
    : addTopic(topic, callback);

  const unsubscribe = () => removeSubscriber(topic, id);

  return unsubscribe;
}

const addTopic = (topic, callback) => {
  const id = 0;
  subscribers[topic] = [{ id, callback }];
  
  return id;
};

const addSubscriber = (topic, callback) => {
  const id = subscribers[topic].length;
  subscribers[topic].push({ id, callback });
  
  return id;
};

const removeSubscriber = (topic, id) => {
  subscribers[topic] = subscribers[topic].filter(s => s.id !== id);
}

module.exports = {
  publish,
  subscribe
}