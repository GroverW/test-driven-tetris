const pubSub = require('../helpers/pubSub');


describe('publish / subscribe', () => {
  let sub1, sub2, sub3;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();

    const adder = () => {
      let sum = 0;

      const unsubscribe = pubSubTest.subscribe('math', amt => { sum += amt });

      const getSum = () => sum;
      
      return {getSum, unsubscribe};
    }

    const multiplier = () => {
      let product = 1;

      const unsubscribe = pubSubTest.subscribe('math', amt => { product *= amt });

      const getProduct = () => product;

      return { getProduct, unsubscribe };
    }

    const messages = () => {
      let messages = [];

      const unsubscribe = pubSubTest.subscribe('message', msg => { messages.push(msg) })

      const getMessages = () => messages;

      return {getMessages, unsubscribe};
    }

    sub1 = adder();
    sub2 = multiplier();
    sub3 = messages();
  })

  test('publish / subscribe', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);

    pubSubTest.publish('math', 2);

    expect(sub1.getSum()).toBe(2);
    expect(sub2.getProduct()).toBe(2);
    expect(sub3.getMessages()).toEqual([]);

    pubSubTest.publish('math', 4);

    expect(sub1.getSum()).toBe(6);
    expect(sub2.getProduct()).toBe(8);
    expect(sub3.getMessages()).toEqual([]);

    pubSubTest.publish('message', 'hello');

    expect(sub1.getSum()).toBe(6);
    expect(sub2.getProduct()).toBe(8);
    expect(sub3.getMessages()).toEqual(['hello']);
  });

  test('nothing happens if no subscribers', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);

    pubSubTest.publish('not a topic', 2);

    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);
    expect(sub3.getMessages()).toEqual([]);
  });

  test('unsubscribe', () => {
    expect(sub1.getSum()).toBe(0);
    expect(sub2.getProduct()).toBe(1);

    pubSubTest.publish('math', 2);

    expect(sub1.getSum()).toBe(2);
    expect(sub2.getProduct()).toBe(2);

    sub2.unsubscribe();

    pubSubTest.publish('math', 3);

    expect(sub1.getSum()).toBe(5);
    expect(sub2.getProduct()).toBe(2);
  })
});