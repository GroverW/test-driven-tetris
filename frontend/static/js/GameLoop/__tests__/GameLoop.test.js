const gameLoop = require('frontend/static/js/GameLoop');
const Command = require('frontend/static/js/Command');
const Animation = require('frontend/static/js/Command/Animation');
const AnimateClearLines = require('frontend/static/js/Command/Animation/AnimateClearLines');
const NullCommand = require('frontend/static/js/Command/NullCommand');
const { publish } = require('frontend/helpers/pubSub');
const { mockAnimation, mockCancelAnimation } = require('frontend/mocks');
const {
  START_GAME,
  GAME_OVER,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/topics');

describe('Game Loop tests', () => {
  let testCommand; let testToggleCommand; let testAutoCommand;
  let testCallback; let testToggleCallback; let testAutoCallback;

  beforeEach(() => {
    gameLoop.initialize(1);
    testCallback = jest.fn();
    testToggleCallback = jest.fn();
    testAutoCallback = jest.fn();
    testCommand = new Command(1, testCallback);
    testToggleCommand = new Command(2, testToggleCallback, [10, 10, 10]);
    testAutoCommand = new Command(false, testAutoCallback, [0, 0, 0]);
    jest.useFakeTimers();

    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
    cancelAnimationFrame = jest.fn().mockImplementation(mockCancelAnimation);
  });

  afterEach(() => {
    jest.clearAllMocks();
    gameLoop.gameOverAction();
  });

  describe('set / clear commands', () => {
    test('should set commands', () => {
      expect(gameLoop.autoCommand).toBe(undefined);
      expect(gameLoop.toggleCommand).toBe(undefined);
      expect(gameLoop.command).toBe(undefined);

      gameLoop[SET_COMMAND](testCommand);
      gameLoop[SET_COMMAND](testToggleCommand);
      gameLoop[SET_AUTO_COMMAND](testAutoCommand);

      expect(gameLoop.command).toBe(testCommand);
      expect(gameLoop.toggleCommand).toBe(testToggleCommand);
      expect(gameLoop.autoCommand).toBe(testAutoCommand);
    });

    test('should not overwrite existing command with same key', () => {
      const newCallback = jest.fn();
      const newCommand = new Command(1, newCallback, [400]);

      gameLoop[SET_COMMAND](testCommand);
      gameLoop[SET_COMMAND](newCommand);

      expect(gameLoop.command).not.toBe(newCommand);
      expect(gameLoop.command).toBe(testCommand);
    });

    test('should clear commands if key matches', () => {
      gameLoop[SET_COMMAND](testCommand);
      gameLoop[SET_COMMAND](testToggleCommand);

      gameLoop[CLEAR_COMMAND](3);

      expect(gameLoop.toggleCommand).toBe(testToggleCommand);
      expect(gameLoop.command).toBe(testCommand);

      gameLoop[CLEAR_COMMAND](gameLoop.toggleCommand.key);
      gameLoop[CLEAR_COMMAND](gameLoop.command.key);

      expect(gameLoop.toggleCommand).toBe(undefined);
      expect(gameLoop.command).toBe(undefined);

      gameLoop[SET_COMMAND](testToggleCommand);
    });
  });

  describe('animate', () => {
    test('sets animation id', () => {
      expect(gameLoop.animationId).toBe(undefined);

      gameLoop[START_GAME]();

      expect(gameLoop.animationId).toEqual(expect.any(Number));
    });

    test('calls commands each frame', () => {
      gameLoop[SET_COMMAND](testToggleCommand);
      gameLoop[SET_AUTO_COMMAND](testAutoCommand);

      gameLoop[START_GAME]();

      expect(testToggleCallback).toHaveBeenCalledTimes(0);
      expect(testAutoCallback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      expect(testToggleCallback).toHaveBeenCalledTimes(10);
      expect(testAutoCallback).toHaveBeenCalledTimes(11);
    });

    test('non-toggled commands should only execute once', () => {
      gameLoop[SET_COMMAND](testCommand);

      expect(testCallback).toHaveBeenCalledTimes(0);

      gameLoop[START_GAME]();
      jest.advanceTimersByTime(1000);

      expect(testCallback).toHaveBeenCalledTimes(1);
    });

    test('should only call animation command if present', () => {
      const animation = new Animation(new NullCommand());
      const animationSpy = jest.spyOn(animation, 'execute');

      gameLoop[SET_COMMAND](animation);
      gameLoop[SET_COMMAND](testCommand);
      gameLoop[SET_COMMAND](testToggleCommand);
      gameLoop[SET_AUTO_COMMAND](testAutoCommand);

      gameLoop[START_GAME]();
      jest.advanceTimersByTime(1000);

      expect(animationSpy).toHaveBeenCalledTimes(11);
      expect(testCallback).toHaveBeenCalledTimes(0);
      expect(testToggleCallback).toHaveBeenCalledTimes(0);
      expect(testAutoCallback).toHaveBeenCalledTimes(0);
    });

    test('should clear animation command when finished', () => {
      const animation = new Animation(new AnimateClearLines());
      const animationSpy = jest.spyOn(animation, 'execute');

      gameLoop[SET_COMMAND](animation);
      gameLoop[START_GAME]();
      jest.advanceTimersByTime(400);

      expect(animationSpy).toHaveBeenCalledTimes(4);
      expect(gameLoop.animation).toBe(undefined);
    });

    test('cancel animation', () => {
      expect(cancelAnimationFrame).toHaveBeenCalledTimes(0);

      gameLoop.stop();

      expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(gameLoop.animationId).toBe(undefined);
    });
  });

  describe('publish / subscribe', () => {
    test('START_GAME should start animation', () => {
      expect(gameLoop.animationId).toBe(undefined);

      publish(START_GAME);

      expect(gameLoop.animationId).toEqual(expect.any(Number));
    });

    test('SET_AUTO_COMMAND should set auto command', () => {
      gameLoop.autoCommand = undefined;

      publish(SET_AUTO_COMMAND, testAutoCommand);

      expect(gameLoop.autoCommand).toBe(testAutoCommand);
    });

    test('SET_COMMAND should set command', () => {
      const newCommand = new Command(0, testCallback);
      expect(gameLoop.command).toBe(undefined);

      publish(SET_COMMAND, newCommand);

      expect(gameLoop.command).toBe(newCommand);
    });

    test('CLEAR_COMMAND should clear command', () => {
      publish(CLEAR_COMMAND, testToggleCommand.key);

      expect(gameLoop.toggleCommand).toBe(undefined);
    });

    test('GAME_OVER should stop animation and unsubscribe if correct playerId', () => {
      const unsubSpy = jest.spyOn(gameLoop, 'unsubscribe');

      gameLoop[START_GAME]();

      expect(cancelAnimationFrame).toHaveBeenCalledTimes(0);
      expect(unsubSpy).toHaveBeenCalledTimes(0);

      publish(GAME_OVER, { id: 2 });

      expect(cancelAnimationFrame).toHaveBeenCalledTimes(0);
      expect(unsubSpy).toHaveBeenCalledTimes(0);

      publish(GAME_OVER, { id: 1 });

      expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(unsubSpy).toHaveBeenCalledTimes(1);
    });
  });
});
