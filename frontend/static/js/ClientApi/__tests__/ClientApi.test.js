const ClientApi = require('frontend/static/js/ClientApi');
const { formatMessage } = require('frontend/helpers/utils');
const { pubSubMock } = require('frontend/mocks');
const { ADD_MESSAGE } = require('frontend/topics');

describe('client api tests', () => {
  const mockWs = { send: jest.fn() };
  let api;
  let pubSubSpy;

  beforeEach(() => {
    api = new ClientApi(mockWs);
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('creates new ClientApi with access to websocket', () => {
      expect(api.ws).toBe(mockWs);
    });
  });

  describe('send message', () => {
    test('sends correctly formatted message', () => {
      const message = { type: 'test', data: 'test' };
      const formatted = formatMessage(message);

      api.sendMessage(message);

      expect(api.ws.send).toHaveBeenLastCalledWith(formatted);
    });

    test('publishes error message if unable to send', () => {
      const publishErrorSpy = pubSubSpy.add(ADD_MESSAGE);
      api.ws.send = jest.fn().mockImplementationOnce(() => { throw new Error(); });

      api.sendMessage('test');

      expect(publishErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('join / create game', () => {
    test('sends correct create message', () => {

    });

    test('sends correct join message', () => {

    });
  });

});
