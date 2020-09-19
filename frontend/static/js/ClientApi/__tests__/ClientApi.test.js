const ClientApi = require('frontend/static/js/ClientApi');
const { formatMessage } = require('frontend/helpers/utils');
const { pubSubMock } = require('frontend/mocks');
const { publish } = require('frontend/helpers/pubSub');
const {
  ADD_MESSAGE, SEND_MESSAGE, CREATE_GAME, JOIN_GAME, LEAVE_GAME,
} = require('frontend/topics');
const { GAME_TYPES } = require('frontend/constants');

describe('client api tests', () => {
  const mockWs = () => ({ send: jest.fn() });
  let ws;
  let api;
  let pubSubSpy;

  beforeEach(() => {
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
    const message = { type: 'test', data: 'test' };
    const formatted = formatMessage(message);

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

  describe('join / create game', () => {
    test('sends correct create message', () => {
      const message = formatMessage({ type: CREATE_GAME, data: GAME_TYPES.MULTI });

      api.createGame(GAME_TYPES.MULTI);

      expect(api.ws.send).toHaveBeenLastCalledWith(message);
    });

    test('sends correct join message', () => {
      const gameId = 'test';
      const message = formatMessage({ type: JOIN_GAME, data: gameId });

      api.joinGame(gameId);

      expect(api.ws.send).toHaveBeenLastCalledWith(message);
    });
  });

  describe('handle message', () => {

  });
});
