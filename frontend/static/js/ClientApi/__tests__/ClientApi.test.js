const { getMockDOMSelector } = require('frontend/mocks');

document.querySelector = jest.fn().mockImplementation(getMockDOMSelector);
document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);

const ClientApi = require('frontend/static/js/ClientApi');
const { formatMessage } = require('frontend/helpers/utils');
const { pubSubMock } = require('frontend/mocks');
const { publish } = require('frontend/helpers/pubSub');
const {
  ADD_MESSAGE, SEND_MESSAGE, CREATE_GAME, JOIN_GAME, LEAVE_GAME, ADD_PLAYER,
} = require('frontend/topics');
const { GAME_TYPES } = require('frontend/constants');

describe('client api tests', () => {
  const mockWs = () => ({ send: jest.fn() });
  let ws;
  let api;
  let pubSubSpy;
  let message;
  let formatted;

  beforeEach(() => {
    message = { type: 'test', data: 'test' };
    formatted = formatMessage(message);
    ws = mockWs();
    api = new ClientApi(ws);
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('creates new ClientApi with access to websocket', () => {
      expect(api.ws).toBe(ws);
    });
  });

  describe('send message', () => {
    test('sends correctly formatted message', () => {
      api.sendMessage(message);

      expect(api.ws.send).toHaveBeenLastCalledWith(formatted);
    });

    test('publishes error message if unable to send', () => {
      const publishErrorSpy = pubSubSpy.add(ADD_MESSAGE);
      api.ws.send = jest.fn().mockImplementationOnce(() => { throw new Error(); });

      api.sendMessage('test');

      expect(publishErrorSpy).toHaveBeenCalledTimes(1);
    });

    test('SEND_MESSAGE sends message', () => {
      publish(SEND_MESSAGE, message);

      expect(api.ws.send).toHaveBeenLastCalledWith(formatted);
    });

    test('unsubscribe removes SEND_MESSAGE subscription', () => {
      api.unsubscribe();

      publish(SEND_MESSAGE, message);

      expect(api.ws.send).toHaveBeenCalledTimes(0);
    });
  });

  describe('join / create / leave game', () => {
    test('sends correct create message', () => {
      const createMessage = formatMessage({ type: CREATE_GAME, data: GAME_TYPES.MULTI });

      api.createGame(GAME_TYPES.MULTI);

      expect(api.ws.send).toHaveBeenLastCalledWith(createMessage);
    });

    test('sends correct join message', () => {
      const gameId = 'test';
      const joinMessage = formatMessage({ type: JOIN_GAME, data: gameId });

      api.joinGame(gameId);

      expect(api.ws.send).toHaveBeenLastCalledWith(joinMessage);
    });

    test('sends correct leave message and publishes LEAVE_GAME', () => {
      const leaveSpy = pubSubSpy.add(LEAVE_GAME);
      const leaveMessage = formatMessage({ type: LEAVE_GAME, data: '' });
      const removeGameSpy = jest.spyOn(api.gameInitializer, 'removeGame');

      api.leaveGame();

      expect(api.ws.send).toHaveBeenLastCalledWith(leaveMessage);
      expect(leaveSpy).toHaveBeenCalledTimes(1);
      expect(removeGameSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('handle message', () => {
    test('ADD_PLAYER initializes game if no game currently', () => {
      const initializeMessage = { type: ADD_PLAYER, data: 1 };
      const formattedInitialize = formatMessage(initializeMessage);

      api.handleMessage(formatted);

      expect(api.gameInitializer.isGameInitialized()).toBe(false);

      api.handleMessage(formattedInitialize);

      expect(api.gameInitializer.isGameInitialized()).toBe(true);
    });

    test('publishes message with respective data', () => {
      const sendSpy = pubSubSpy.add(message.type);

      api.handleMessage(formatted);

      expect(sendSpy).toHaveBeenLastCalledWith(message.data);
    });
  });
});
