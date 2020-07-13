const { publish, subscribe } = require('frontend/helpers/pubSub');

describe('publish / subscribe', () => {
  let sub1; let sub2; let
    sub3;
  const topicMath = 'math';
  const topicMessage = 'message';

  beforeEach(() => {
    const adder = () => {
      let sum = 0;

      const unsubscribe = subscribe(topicMath, (amt) => { sum += amt; });

      const getSum = () => sum;

      return { getSum, unsubscribe };
    };

    const multiplier = () => {
      let product = 1;

      const unsubscribe = subscribe(topicMath, (amt) => { product *= amt; });

      const getProduct = () => product;

      return { getProduct, unsubscribe };
    };

    const messages = () => {
      const messageList = [];

      const unsubscribe = subscribe(topicMessage, (msg) => { messageList.push(msg); });

      const getMessages = () => messageList;

      return { getMessages, unsubscribe };
    };

    sub1 = adder();
    sub2 = multiplier();
    sub3 = messages();
  });

  test('publish / subscribe', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);

    publish(topicMath, 2);

    expect(sub1.getSum()).toBe(2);
    expect(sub2.getProduct()).toBe(2);
    expect(sub3.getMessages()).toEqual([]);

    publish(topicMath, 4);

    expect(sub1.getSum()).toBe(6);
    expect(sub2.getProduct()).toBe(8);
    expect(sub3.getMessages()).toEqual([]);

    publish(topicMessage, 'hello');

    expect(sub1.getSum()).toBe(6);
    expect(sub2.getProduct()).toBe(8);
    expect(sub3.getMessages()).toEqual(['hello']);
  });

  test('nothing happens if no subscribers', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);

    publish('not a topic', 2);

    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);
  });

  test('unsubscribe', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);

    publish(topicMath, 2);

    expect(sub1.getSum()).toBe(2);
    expect(sub2.getProduct()).toBe(2);

    sub2.unsubscribe();

    publish(topicMath, 3);

    expect(sub1.getSum()).toBe(5);
    expect(sub2.getProduct()).toBe(2);
  });
});
