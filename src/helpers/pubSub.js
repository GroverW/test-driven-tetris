const pubSub = () => ({
  subscribers: {},
  publish(topic, data) {
    this.subscribers[topic] && this.subscribers[topic].forEach(obj => obj.callback(data));
  },
  subscribe(topic, callback) {
    const id = this.subscribers[topic]
      ? this.addSubscriber(topic, callback)
      : this.addTopic(topic, callback);

    const unsubscribe = () => {
      this.removeSubscriber(topic, id);
    };

    return unsubscribe;
  },
  addTopic(topic, callback) {
    const id = 0;
    this.subscribers[topic] = [{ id, callback }];
    
    return id;
  },
  addSubscriber(topic, callback) {
    const id = this.subscribers[topic].length;
    this.subscribers[topic].push({ id, callback });
    
    return id;
  },
  removeSubscriber(topic, id) {
    this.subscribers[topic] = this.subscribers[topic].filter(s => s.id !== id);
  }
})


module.exports = pubSub;