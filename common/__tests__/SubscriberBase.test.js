const SubscriberBase = require('common/js/SubscriberBase');
const pubSub = require('frontend/helpers/pubSub');

describe('SubscriberBase tests', () => {
  let subscriberBase;
  const TOPIC1 = 'topic1';
  const TOPIC2 = 'topic2';
  const topics = [TOPIC1, TOPIC2]

  beforeAll(() => {
    subscriberBase = new SubscriberBase(1, pubSub);
    subscriberBase.val1 = 0;
    subscriberBase.val2 = 0;
    subscriberBase[TOPIC1] = function() { this.val1 += 1 };
    subscriberBase[TOPIC2] = function() { this.val2 += 2 };
  });

  test('should not initially be subscribed to topics', () => {
    expect(subscriberBase.val1).toBe(0);
    expect(subscriberBase.val2).toBe(0);

    pubSub.publish(TOPIC1);
    pubSub.publish(TOPIC2);

    expect(subscriberBase.val1).toBe(0);
    expect(subscriberBase.val2).toBe(0);
  });

  test('maps subscribers to topics', () => {
    expect(subscriberBase.subscriptions.length).toBe(0);

    subscriberBase.mapSubscriptions(topics);

    pubSub.publish(TOPIC1);
    pubSub.publish(TOPIC2);

    expect(subscriberBase.val1).toBe(1);
    expect(subscriberBase.val2).toBe(2);
  });

  test('unsubscribes from topics', () => {
    subscriberBase.unsubscribe();

    pubSub.publish(TOPIC1);
    pubSub.publish(TOPIC2);

    expect(subscriberBase.val1).toBe(1);
    expect(subscriberBase.val2).toBe(2);
  });
});