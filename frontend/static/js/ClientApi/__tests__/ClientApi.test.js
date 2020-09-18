const ClientApi = require('frontend/static/js/ClientApi');

describe('client api tests', () => {
  const mockWs = { send: jest.fn() };
  let api;

  beforeEach(() => {
    api = new ClientApi(mockWs);
  });

  describe('setup', () => {
    test('creates new ClientApi with access to websocket', () => {
      expect(api.ws).toBe(mockWs);
    });
  });


});
