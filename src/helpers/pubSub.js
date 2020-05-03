const pubSub = () => ({
  subscribers: {},
  publish(topic, data) {
    this.subscribers[topic] && this.subscribers[topic].forEach(callback => callback(data));
  },
  subscribe (topic, callback) {
    this.subscribers[topic]
      ? this.subscribers[topic].push(callback)
      : this.subscribers[topic] = [callback];
  
    const index = this.subscribers[topic].length - 1;
    const unsubscribe = () => { this.subscribers[topic].splice(index, 1) };
  
    return unsubscribe;
  }
})


module.exports = pubSub;