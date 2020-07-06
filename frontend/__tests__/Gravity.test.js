const Gravity = require('frontend/static/js/Gravity');


describe('gravity tests', () => {
  let gravity;
  let validMove = true;
  let fakeMoveCheck = () => validMove;
  let fakeCallback = jest.fn();

  beforeAll(() => {
    gravity = new Gravity(1, fakeCallback, fakeMoveCheck);
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.clearFakeTimers();
  });

  describe('setup', () => {
    test('get initial delaay', () => {

    });
  });

  describe('calculate delay', () => {
    test('base delay - level 1', () => {

    });

    test('delay changes with level', () => {

    });

    test('does not go over max delay', () => {

    });

    test('interrupts delay', () => {

    });

    test('increments lock delay', () => {

    });
    
    test('lock delay added when invalid next move', () => {

    });

    test('lock delay reset after callback execution', () => {

    });
  });

  describe('execute callback', () => {
    test('does not call callback when delay threshhold not met', () => {

    });

    test('calls callback when delay threshhold met', () => {

    });
  });

  describe('publish / subscribe', () => {
    test('UPDATE_SCORE should update level if level included', () => {

    });

    test('ADD_LOCK_DELAY should add lock delay', () => {

    });

    test('INTERRUPT_DELAY should interrupt delay', () => {

    });

    test('GAME_OVER should unsubscribe if correct playerId', () => {

    });
  });
});