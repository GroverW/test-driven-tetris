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
const serverPubSub = require('../../src/helpers/pubSub');
const { GAMES } = require("../../src/helpers/data");
const { mockSend } = require('../../src/helpers/mocks');


describe('websocket tests', () => {
  let player2;
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

    player2 = new Player(mockSend, serverPubSub());

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);

    clientToServer.open();
  });

  afterEach(() => {
    jest.clearAllMocks();
    serverToClient.unsubAll();
    clientToServer.unsubAll();
    GAMES.clear();
  })

  test('player opens WS connection', () => {
    // connection opened in setup
    expect(clientToServer.player).toEqual(expect.any(Player));
  });

  test('player is added to room', () => {
    serverToClient.addPlayer(clientToServer.player.id);
    expect(serverToClient.game).toEqual(expect.any(Game));
  });

  test('second player is added to room', () => {
    // no additional players
    expect(serverToClient.gameDOM.players.length).toBe(0);

    clientToServer.gameServer.join(player2);

    // one additional player
    expect(serverToClient.gameDOM.players.length).toBe(1);
  });

  test('second player is removed from room', () => {
    clientToServer.gameServer.join(player2);

    expect(serverToClient.gameDOM.players.length).toBe(1);
    expect(serverToClient.gameDOM.gameView.players.length).toBe(1);

    player2.leave();

    expect(serverToClient.gameDOM.players.length).toBe(0);
    expect(serverToClient.gameDOM.gameView.players.length).toBe(0);
  });

  test('game start - initiated by client', () => {
    serverToClient.game.start();

    expect(clientToServer.gameServer.gameStarted).toBe(true);
  })
});