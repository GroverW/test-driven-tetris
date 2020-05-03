const { 
  webSocketMock,
  getMockCtx,
  getMockDOMSelector 
} = require("../helpers/mocks");
const { 
  MockServerListener,
  MockClientListener 
} = require("../helpers/mockWSListeners");
const Player = require('../../src/js/player');
const Game = require('../static/js/game');
const { GAMES } = require("../../src/helpers/data");


describe('websocket tests', () => {
  let serverToClient;
  let clientToServer;

  beforeEach(() => {
    WebSocket = jest.fn().mockImplementation(webSocketMock);
    
    const selectors = {
      playerCtx: getMockCtx(),
      nextCtx: getMockCtx(),
      gameContainer: getMockDOMSelector(),
      scoreSelector: getMockDOMSelector(),
      levelSelector: getMockDOMSelector(),
      linesSelector: getMockDOMSelector()
    }
    
    serverToClient = new MockClientListener(webSocketMock, selectors);
    clientToServer = new MockServerListener(webSocketMock, 1);

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    GAMES.clear();
  })

  test('player opens WS connection', () => {
    expect(clientToServer.player).toBe(undefined);
    
    clientToServer.open()

    expect(clientToServer.player).toEqual(expect.any(Player));
  });

  test('player is added to room', () => {
    expect(serverToClient.game).toBe(undefined);
    clientToServer.open();

    serverToClient.addPlayer(clientToServer.player.id);
    expect(serverToClient.game).toEqual(expect.any(Game));
  })
});