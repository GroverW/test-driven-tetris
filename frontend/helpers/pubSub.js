let subscribers = {};

const publish = (topic, data) => {
  subscribers[topic] && subscribers[topic].forEach(callback => callback(data));
}

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