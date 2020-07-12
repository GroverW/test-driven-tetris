const Command = require('frontend/static/js/Command');
const { pubSubMock } = require('frontend/mockData/mocks');
const { ADD_TO_QUEUE } = require('frontend/helpers/clientTopics');

describe('Command Tests', () => {
  let command; let
    commandToggle;
  let callback; let
    callbackToggle;
  let pubSubSpy;

  beforeAll(() => {
    callback = jest.fn();
    callbackToggle = jest.fn();
    command = new Command(1, callback, [1]);
    commandToggle = new Command(2, callback, [10, 100, 200]);
    pubSubSpy = pubSubMock();
  });

  afterAll(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribeAll();
  });

  describe('setup', () => {
    test('get initial delay', () => {
      expect(command.delay).toBe(1);
      expect(commandToggle.delay).toBe(10);
    });

    test('command types', () => {
      expect(command.type).toBe('command');
      expect(commandToggle.type).toBe('toggleCommand');
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

    test('publishes to command queue', () => {
      const addToQueueSpy = pubSubSpy.add(ADD_TO_QUEUE);

      command.execute(Infinity);

      expect(addToQueueSpy).toHaveBeenCalledTimes(1);
    });

    test('delay time not met', () => {
      expect(callbackToggle).toHaveBeenCalledTimes(0);

      commandToggle.execute(0);

      expect(callbackToggle).toHaveBeenCalledTimes(0);
    });
  });

  describe('update delay', () => {
    test('iterates through delay', () => {
      expect(commandToggle.delay).toBe(commandToggle._delay[0]);

      commandToggle.updateDelay();

      expect(commandToggle.delay).toBe(commandToggle._delay[1]);
    });

    test('handles toggling on successful execute', () => {
      const updateDelaySpy = jest.spyOn(commandToggle, 'updateDelay');

      commandToggle.execute(50);

      expect(updateDelaySpy).toHaveBeenCalledTimes(0);

      commandToggle.execute(150);

      expect(updateDelaySpy).toHaveBeenCalledTimes(1);

      expect(commandToggle.delay).toBe(200);
    });

    test('does not go over max delay', () => {
      expect(commandToggle._delayIdx).toBe(2);

      commandToggle.updateDelay();

      expect(commandToggle._delayIdx).toBe(2);
    });
  });
});
