const { publish, subscribe } = require('frontend/helpers/pubSub');

describe('publish / subscribe', () => {
  let adderSub; let multiplierSub; let messagesSub;
  const topicMath = 'math';
  const topicMessage = 'message';

  beforeEach(() => {
    const subscription = (defaultValue, topic, callback) => {
      let value = defaultValue;

      const unsubscribe = subscribe(topic, (arg) => { value = callback(value, arg) });

      const getValue = () => value;

      return { getValue, unsubscribe };
    };

    adderSub = subscription(0, topicMath, (curr, amt) => curr + amt);
    multiplierSub = subscription(1, topicMath, (curr, amt) => curr * amt);
    messagesSub = subscription([], topicMessage, (curr, msg) => ([...curr, msg]));
  });

  test('publish / subscribe', () => {
    expect(adderSub.getValue()).toBe(0);
    expect(multiplierSub.getValue()).toBe(1);
    expect(messagesSub.getValue()).toEqual([]);

    publish(topicMath, 2);

    expect(adderSub.getValue()).toBe(2);
    expect(multiplierSub.getValue()).toBe(2);
    expect(messagesSub.getValue()).toEqual([]);

    publish(topicMath, 4);

    expect(adderSub.getValue()).toBe(6);
    expect(multiplierSub.getValue()).toBe(8);
    expect(messagesSub.getValue()).toEqual([]);

    publish(topicMessage, 'hello');

    expect(adderSub.getValue()).toBe(6);
    expect(multiplierSub.getValue()).toBe(8);
    expect(messagesSub.getValue()).toEqual(['hello']);
  });

  test('nothing happens if no subscribers', () => {
    expect(adderSub.getValue()).toBe(0);
    expect(multiplierSub.getValue()).toBe(1);
    expect(messagesSub.getValue()).toEqual([]);

    publish('not a topic', 2);

    expect(adderSub.getValue()).toBe(0);
    expect(multiplierSub.getValue()).toBe(1);
    expect(messagesSub.getValue()).toEqual([]);
  });

  test('unsubscribe', () => {
    expect(adderSub.getValue()).toBe(0);
    expect(multiplierSub.getValue()).toBe(1);

    publish(topicMath, 2);

    expect(adderSub.getValue()).toBe(2);
    expect(multiplierSub.getValue()).toBe(2);

    multiplierSub.unsubscribe();

    publish(topicMath, 3);

    expect(adderSub.getValue()).toBe(5);
    expect(multiplierSub.getValue()).toBe(2);
  });
});
