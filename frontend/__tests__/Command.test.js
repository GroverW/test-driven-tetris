const Command = require('frontend/static/js/Command');
const { pubSubMock } = require('frontend/mockData/mocks');
const { ADD_TO_QUEUE } = require('frontend/helpers/clientTopics');

describe('Command Tests', () => {
  let command; let commandToggle;
  let callback; let callbackToggle;
  let pubSubSpy;

  beforeEach(() => {
    callback = jest.fn();
    callbackToggle = jest.fn();
    command = new Command(1, callback, [1]);
    commandToggle = new Command(2, callback, [10, 100, 200]);
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribe();
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

    test('calls callback and adds to queue when delay time met', () => {
      command.execute(0);

      expect(callback).toHaveBeenCalledTimes(0);
      const addToQueueSpy = pubSubSpy.add(ADD_TO_QUEUE);

      command.execute(1);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(addToQueueSpy).toHaveBeenCalledTimes(1);
    });

    test('delay time not met', () => {
      commandToggle.execute(0);

      expect(callbackToggle).toHaveBeenCalledTimes(0);

      commandToggle.execute(1);

      expect(callbackToggle).toHaveBeenCalledTimes(0);
    });
  });

  describe('update delay', () => {
    test('iterates through delay', () => {
      expect(commandToggle.delay).toBe(commandToggle.delayList[0]);

      commandToggle.updateDelay();

      expect(commandToggle.delay).toBe(commandToggle.delayList[1]);
    });

    test('handles toggling on successful execute', () => {
      commandToggle.execute(0);

      const updateDelaySpy = jest.spyOn(commandToggle, 'updateDelay');

      commandToggle.execute(5);

      expect(updateDelaySpy).toHaveBeenCalledTimes(0);

      commandToggle.execute(10);

      expect(updateDelaySpy).toHaveBeenCalledTimes(1);

      expect(commandToggle.delay).toBe(100);
    });

    test('does not go over max delay', () => {
      commandToggle.updateDelay();
      commandToggle.updateDelay();

      expect(commandToggle.delayIdx).toBe(2);

      commandToggle.updateDelay();

      expect(commandToggle.delayIdx).toBe(2);
    });
  });
});
