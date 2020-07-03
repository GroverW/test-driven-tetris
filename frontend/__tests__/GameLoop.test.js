const GameLoop = require('frontend/static/js/GameLoop');
const Command = require('frontend/static/js/Command');
const { mockAnimation } = require('frontend/mockData/mocks');

describe('Game Loop tests', () => {
  let gameLoop;
  let testCommand, testAutoCommand;
  let testCallback, testAutoCallback;

  beforeAll(() => {
    gameLoop = new GameLoop();
    testCallback = jest.fn();
    testToggleCallback = jest.fn();
    testAutoCallback = jest.fn();
    testCommand = new Command(1, testCallback);
    testToggleCommand = new Command(2, testToggleCallback, 0, [10]);
    testAutoCommand = new Command(false, testAutoCallback, 0, [0]);
    jest.useFakeTimers();

    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.cleaarFakeTimers();
  });

  describe('set / clear commands', () => {
    test('should set commands', () => {
      expect(gameLoop.autoCommand).toBe(undefined);
      expect(gameLoop.command).toBe(undefined);
  
      gameLoop.setCommand(testCommand);
      gameLoop.setAutoCommand(testAutoCommand);
  
      expect(gameLoop.command).toBe(testCommand);
      expect(gameLoop.autoCommand).toBe(testAutoCommand);
    });
  
    test('should not overwrite existing command with same key', () => {
      let newCallback = jest.fn();
      let newCommand = new Command(1, newCallback, 400);
  
      gameLoop.setCommand(newCommand);
      expect(testCommand).not.toBe(newCommand);
      expect(gameLoop.command).toBe(testCommand);
    })
  
    test('should clear commands if key matches', () => {
      gameLoop.clearCommand(2);
  
      expect(gameLoop.command).toBe(testCommand);
  
      gameLoop.clearCommand(1);
  
      expect(gameLoop.command).toBe(undefined);
    });
  });
  
  describe('animate', () => {
    test('sets animation id', () => {
      expect(gameLoop.animationId).toBe(undefined);
  
      gameLoop.animate();
  
      expect(gameLoop.animationId).toEqual(expect.any(Number));
    });

    test('calls commands each frame', () => {
      gameLoop.setCommand(testToggleCommand);
      expect(testToggleCallback).toHaveBeenCalledTimes(0);
      expect(testAutoCallback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      expect(testToggleCallback).toHaveBeenCalledTimes(9);
      expect(testAutoCallback).toHaveBeenCalledTimes(11);
    });

    test('non-toggled commands should only execute once', () => {
      gameLoop.setCommand(testCommand);

      expect(testCallback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(1000);

      expect(testCallback).toHaveBeenCalledTimes(1);
    });
  });
});