const GameLoop = require('frontend/static/js/GameLoop');
const Command = require('frontend/static/js/Command');
const { publish } = require('frontend/helpers/pubSub');
const { mockAnimation } = require('frontend/mockData/mocks');
const { 
  START_GAME,
  GAME_OVER,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');

describe('Game Loop tests', () => {
  let gameLoop;
  let testCommand, testAutoCommand;
  let testCallback, testAutoCallback;

  beforeAll(() => {
    gameLoop = new GameLoop(1);
    testCallback = jest.fn();
    testToggleCallback = jest.fn();
    testAutoCallback = jest.fn();
    testCommand = new Command(1, testCallback);
    testToggleCommand = new Command(2, testToggleCallback, [10]);
    testAutoCommand = new Command(false, testAutoCallback, [0]);
    jest.useFakeTimers();

    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
    cancelAnimationFrame = jest.fn();
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
      expect(gameLoop.command).toBe(testCommand)

      publish(SET_COMMAND, testToggleCommand);

      expect(gameLoop.command).toBe(testToggleCommand);
    });

    test('CLEAR_COMMAND should clear command', () => {
      publish(CLEAR_COMMAND, testToggleCommand.key);

      expect(gameLoop.command).toBe(undefined);
    });

    test('GAME_OVER should stop animation and unsubscribe if correct playerId', () => {
      const unsubSpy = jest.spyOn(gameLoop, 'unsubscribe');
      
      expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(unsubSpy).toHaveBeenCalledTimes(0);
      
      publish(GAME_OVER, { id: 2 });
      
      expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(unsubSpy).toHaveBeenCalledTimes(0);
      
      publish(GAME_OVER, { id: 1 });
      
      expect(cancelAnimationFrame).toHaveBeenCalledTimes(2);
      expect(unsubSpy).toHaveBeenCalledTimes(1);
    });
  });
});