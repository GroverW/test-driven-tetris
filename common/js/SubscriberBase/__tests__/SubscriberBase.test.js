const SubscriberBase = require('common/js/SubscriberBase');
const pubSub = require('frontend/helpers/pubSub');

const { GAME_OVER, END_GAME, LEAVE_GAME } = require('common/topics');

describe('SubscriberBase tests', () => {
  let subscriberBase;
  const TOPIC1 = 'topic1';
  const TOPIC2 = 'topic2';
  const topics = [TOPIC1, TOPIC2];

  beforeEach(() => {
    subscriberBase = new SubscriberBase(pubSub, 1);
    subscriberBase.val1 = 0;
    subscriberBase.val2 = 0;
    subscriberBase[TOPIC1] = () => { subscriberBase.val1 += 1; };
    subscriberBase[TOPIC2] = () => { subscriberBase.val2 += 2; };
  });

  afterEach(() => {
    subscriberBase.unsubscribe();
    jest.clearAllMocks();
  });

  describe('map subscriptions', () => {
    test('should not initially be subscribed to topics', () => {
      expect(subscriberBase.val1).toBe(0);
      expect(subscriberBase.val2).toBe(0);

      pubSub.publish(TOPIC1);
      pubSub.publish(TOPIC2);

      expect(subscriberBase.val1).toBe(0);
      expect(subscriberBase.val2).toBe(0);
    });

    test('maps subscribers to topics', () => {
      const numSubs = subscriberBase.subscriptions.length;

      subscriberBase.mapSubscriptions(topics);

      pubSub.publish(TOPIC1);
      pubSub.publish(TOPIC2);

      expect(subscriberBase.val1).toBe(1);
      expect(subscriberBase.val2).toBe(2);
      expect(subscriberBase.subscriptions.length).toBe(numSubs + 2);
    });
  });

  describe('publish / subscribe', () => {
    test('GAME_OVER should call gameOverAction if correct id', () => {
      const gameOverActionSpy = jest.spyOn(subscriberBase, 'gameOverAction');

      pubSub.publish(GAME_OVER, { id: Infinity });

      expect(gameOverActionSpy).toHaveBeenCalledTimes(0);

      pubSub.publish(GAME_OVER, { id: subscriberBase.playerId });

      expect(gameOverActionSpy).toHaveBeenCalledTimes(1);
    });

    test('END_GAME should call endGameAction', () => {
      const endGameActionSpy = jest.spyOn(subscriberBase, 'endGameAction');

      pubSub.publish(END_GAME);

      expect(endGameActionSpy).toHaveBeenCalledTimes(1);
    });

    test('LEAVE_GAME should call gameOver, endGame and leaveGame actions', () => {
      const gameOverActionSpy = jest.spyOn(subscriberBase, 'gameOverAction');
      const endGameActionSpy = jest.spyOn(subscriberBase, 'endGameAction');
      const leaveGameActionSpy = jest.spyOn(subscriberBase, 'leaveGameAction');

      pubSub.publish(LEAVE_GAME);

      expect(gameOverActionSpy).toHaveBeenCalledTimes(1);
      expect(endGameActionSpy).toHaveBeenCalledTimes(1);
      expect(leaveGameActionSpy).toHaveBeenCalledTimes(1);
    });

    test('unsubscribes from topics', () => {
      subscriberBase.unsubscribe();

      pubSub.publish(TOPIC1);
      pubSub.publish(TOPIC2);

      expect(subscriberBase.val1).toBe(0);
      expect(subscriberBase.val2).toBe(0);
    });
  });
});
