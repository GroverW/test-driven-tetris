const GameLoop = require('frontend/static/js/GameLoop');
const { mockAnimation } = require('frontend/mockData/mocks');

describe('Game Loop tests', () => {
  let gameLoop;
  let testCommand, testAutoCommand;

  beforeAll(() => {
    gameLoop = new GameLoop();
    testCommand = jest.fn();
    testAutoCommand = jest.fn();
    jest.useFakeTimers();

    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.cleaarFakeTimers();
  });

  test('set command', () => {
    expect(gameLoop.autoCommand).toBe(undefined);
    expect(gameLoop.command).toBe(undefined);

    gameLoop.setCommand(testCommand);
    gameLoop.setAutoCommand(testAutoCommand);

    expect(gameLoop.command).toBe(testCommand);
    expect(gameLoop.autoCommand).toBe(testAutoCommand);
  });

  test('clear command', () => {
    gameLoop.clearCommand();

    expect(gameLoop.command).toBe(undefined);
  })

  
  describe('animate', () => {
    test('sets animation id', () => {
      expect(gameLoop.animationId).toBe(undefined);
  
      gameLoop.animate();
  
      expect(gameLoop.animationId).toEqual(expect.any(Number));
    });

    test('calls commands each frame', () => {
      expect(testCommand).toHaveBeenCalledTimes(1);
      expect(testAutoCommand).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      expect(testCommand).toHaveBeenCalledTimes(11);
      expect(testAutoCommand).toHaveBeenCalledTimes(11);
    });
  });

  
});