const Command = require('frontend/static/js/Command');

describe('Command Tests', () => {
  let command, commandToggle;
  let callback, callbackToggle;

  beforeAll(() => {
    callback = jest.fn();
    callbackToggle = jest.fn();
    command = new Command(1, callback, false, 1);
    commandToggle = new Command(2, callback, [10,100,200]);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('get initial delay', () => {
      const delay = command.getInitialDelay(100);
      expect(delay).toBe(100);
  
      expect(command.delay).toBe(1);
      expect(commandToggle.delay).toBe(10);
    });
  });

  describe('execute command', () => {
    test('sets start time on first call', () => {
      expect(command.startTime).toBe(undefined);
      
      command.execute(0);
      
      expect(command.startTime).toBe(0);
    });
  
    test('delay time met', () => {
      expect(callback).toHaveBeenCalledTimes(0);
      
      command.execute(1);
  
      expect(callback).toHaveBeenCalledTimes(1);
    });
  
    test('delay time not met', () => {
      expect(callbackToggle).toHaveBeenCalledTimes(0);
  
      commandToggle.execute(0);
  
      expect(callbackToggle).toHaveBeenCalledTimes(0);
    });
  });

  describe('toggle command', () => {
    test('handles toggling', () => {
      expect(commandToggle.delay).toBe(10);
  
      commandToggle.handleToggle();
  
      expect(commandToggle.delay).toBe(100);
    });
  
    test('handles toggling on successful execute', () => {
      const handleToggleSpy = jest.spyOn(commandToggle, 'handleToggle');
  
      commandToggle.execute(50);
      
      expect(handleToggleSpy).toHaveBeenCalledTimes(0);
      
      commandToggle.execute(150);
  
      expect(handleToggleSpy).toHaveBeenCalledTimes(1);
  
      expect(commandToggle.delay).toBe(200);
    });
  
    test('does not go over max delay', () => {
      expect(commandToggle.toggleIdx).toBe(2);

      commandToggle.handleToggle();
      
      expect(commandToggle.toggleIdx).toBe(2);
    });
  });
});