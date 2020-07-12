const Gravity = require('frontend/static/js/Gravity');
const {
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('frontend/helpers/clientConstants');
const {
  UPDATE_SCORE,
  ADD_LOCK_DELAY,
  INTERRUPT_DELAY,
  GAME_OVER,
} = require('frontend/helpers/clientTopics');
const { publish } = require('frontend/helpers/pubSub');
const { pubSubMock } = require('frontend/mockData/mocks');

describe('gravity tests', () => {
  let gravity;
  let validMove = false;
  const fakeMoveCheck = () => validMove;
  const fakeCallback = jest.fn();
  const playerId = 1;
  let pubSubSpy;

  beforeAll(() => {
    gravity = new Gravity(playerId, fakeCallback, fakeMoveCheck);
    jest.useFakeTimers();
    pubSubSpy = pubSubMock();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.clearFakeTimers();
    pubSubSpy.unsubscribeAll();
  });

  describe('calculate delay', () => {
    test('base delay - level 1', () => {
      expect(gravity.delay).toBe(ANIMATION_SPEED[1]);
    });

    test('delay changes with level', () => {
      gravity[UPDATE_SCORE]({ level: 2 });

      expect(gravity.level).toBe(2);
      expect(gravity.delay).toBe(ANIMATION_SPEED[2]);
    });

    test('does not go over max delay', () => {
      gravity.level = 100;
      expect(gravity.delay).toBe(ANIMATION_SPEED[MAX_SPEED]);
    });

    test('sets flag to interrupt delay', () => {
      expect(gravity.interrupt).toBe(false);
      gravity[INTERRUPT_DELAY]();
      expect(gravity.interrupt).toBe(true);
    });

    test('increments lock delay', () => {
      const { lockDelay } = gravity;
      gravity[ADD_LOCK_DELAY]();
      expect(gravity.lockDelay).toBeGreaterThan(lockDelay);
    });

    test('lock delay added when invalid next move', () => {
      const currDelay = gravity.delay;

      expect(gravity.delay).toBe(currDelay);

      gravity.isValidNextMove = false;

      expect(gravity.delay).toBeGreaterThan(currDelay);
    });
  });

  describe('execute callback', () => {
    test('does not call callback when delay threshhold not met', () => {
      const currStart = gravity.start;
      const currDelay = gravity.delay;

      gravity.execute(currStart + currDelay - 1);

      expect(fakeCallback).toHaveBeenCalledTimes(0);
    });

    test('calls callback when delay threshhold met, resets start time and lock delay', () => {
      const currStart = gravity.start;
      const currDelay = gravity.delay;
      const currLockDelay = gravity.lockDelay;

      gravity.execute(currStart + currDelay);

      expect(fakeCallback).toHaveBeenCalledTimes(1);
      expect(gravity.start).toBe(currStart + currDelay);
      expect(gravity.lockDelay).toBeLessThan(currLockDelay);
    });

    test('interrupt delay resets start time if valid next move', () => {
      let { start, delay } = gravity;

      gravity.interruptDelay();

      gravity.execute(start + delay);

      expect(fakeCallback).toHaveBeenCalledTimes(2);

      ({ start, delay } = gravity);

      validMove = true;

      gravity.execute(start + delay);

      expect(fakeCallback).toHaveBeenCalledTimes(2);
      expect(gravity.interrupt).toBe(false);
    });
  });

  describe('publish / subscribe', () => {
    test('UPDATE_SCORE should update level if level included', () => {
      const currLevel = gravity.level;

      publish(UPDATE_SCORE, {});

      expect(gravity.level).toBe(currLevel);

      publish(UPDATE_SCORE, { level: gravity.level + 1 });

      expect(gravity.level).toBeGreaterThan(currLevel);
    });

    test('ADD_LOCK_DELAY should add lock delay', () => {
      const currLockDelay = gravity.lockDelay;

      publish(ADD_LOCK_DELAY);

      expect(gravity.lockDelay).toBeGreaterThan(currLockDelay);
    });

    test('INTERRUPT_DELAY should interrupt delay', () => {
      expect(gravity.interrupt).toBe(false);

      publish(INTERRUPT_DELAY);

      expect(gravity.interrupt).toBe(true);
    });

    test('GAME_OVER should unsubscribe if correct playerId', () => {
      gravity.level = 1;
      gravity.interrupt = false;
      const currDelay = gravity.lockDelay;

      publish(GAME_OVER, { id: Infinity });

      publish(INTERRUPT_DELAY);

      expect(gravity.interrupt).toBe(true);

      gravity.interrupt = false;

      publish(GAME_OVER, { id: playerId });

      publish(ADD_LOCK_DELAY);
      publish(INTERRUPT_DELAY);
      publish(UPDATE_SCORE, { level: 20 });

      expect(gravity.lockDelay).toBe(currDelay);
      expect(gravity.interrupt).toBe(false);
      expect(gravity.level).toBe(1);
    });
  });
});
