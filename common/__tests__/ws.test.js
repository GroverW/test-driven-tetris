const Player = require('../../src/js/player');
const ClientGame = require('../../frontend/static/js/clientGame');
const Api = require('../../frontend/helpers/api');

const serverPubSub = require('../../src/helpers/pubSub');

const { CONTROLS } = require('../../frontend/helpers/clientConstants');
const { GAMES } = require("../../src/helpers/serverConstants");

const { webSocketMock } = require("../mockData/mocks");
const { getMockCtx, getMockDOMSelector, pubSubMocks } = require("../../frontend/mockData/mocks");
const { MockServerListener, MockClientListener } = require("../mockData/mockWSListeners");
const { mockSend, getTestBoard } = require('../mockData/mocks');


describe('websocket tests', () => {
  let player2;
  let serverToClient;
  let clientToServer;
  let pubSub;
  let api;

  beforeEach(() => {
    WebSocket = jest.fn().mockImplementation(webSocketMock);
    api = new Api(webSocketMock, 1);
    api.sendMessage = jest.fn().mockImplementation(webSocketMock.send);
    
    pubSub = pubSubMocks();

    const selectors = {
      playerCtx: getMockCtx(),
      nextCtx: getMockCtx(),
      gameContainer: getMockDOMSelector(),
      scoreSelector: getMockDOMSelector(),
      levelSelector: getMockDOMSelector(),
      linesSelector: getMockDOMSelector(),
      playerSelector: getMockDOMSelector(),
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
    api.unsubscribe();
    GAMES.clear();
  })

  test('player opens WS connection', () => {
    // connection opened in setup
    expect(clientToServer.player).toEqual(expect.any(Player));
  });

  test('player is added to room', () => {
    serverToClient.addPlayer(clientToServer.player.id);
    expect(serverToClient.game).toEqual(expect.any(ClientGame));
  });

  test('second player is added to room', () => {
    const sendAllSpy = jest.spyOn(clientToServer.gameServer, 'sendAll');
    const sendToSpy = jest.spyOn(clientToServer.gameServer, 'sendTo');

    // no additional players
    expect(serverToClient.gameDOM.players.length).toBe(0);
    expect(sendAllSpy).toHaveBeenCalledTimes(0);
    expect(sendToSpy).toHaveBeenCalledTimes(0);

    clientToServer.gameServer.join(player2);

    // one additional player
    expect(serverToClient.gameDOM.players.length).toBe(1);
    
    expect(sendAllSpy).toHaveBeenCalledTimes(1);
    // player joining should receive all other players in game
    // 2 calls for sendAll, 1 to send p1 info to p2
    expect(sendToSpy).toHaveBeenCalledTimes(3);

    let player3 = new Player(mockSend, serverPubSub());

    clientToServer.gameServer.join(player3);

    expect(serverToClient.gameDOM.players.length).toBe(2);
    
    expect(sendAllSpy).toHaveBeenCalledTimes(2);
    // player 1 and 2 should be send to player 3
    // 3 for sendAll, 2 for p1 and p2 info to p3
    expect(sendToSpy).toHaveBeenCalledTimes(8);
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
    // user will click button which will send newGame to server
    expect(serverToClient.game.gameStatus).toBe(false);
    
    clientToServer.startGame();

    expect(clientToServer.gameServer.gameStarted).toBe(true);
    expect(serverToClient.game.gameStatus).toBe(true);
    expect(pubSub.drawMock).toHaveBeenCalledTimes(1);
  });

  test('game start - subsequent game starts should fail', () => {
    const getPiecesSpy = jest.spyOn(serverToClient.game.board, 'getPieces');

    expect(getPiecesSpy).toHaveBeenCalledTimes(0);

    clientToServer.startGame();

    expect(getPiecesSpy).toHaveBeenCalledTimes(1);

    clientToServer.startGame();

    expect(getPiecesSpy).toHaveBeenCalledTimes(1);
  })

  test('add pieces', () => {
    clientToServer.startGame();

    const serverPieces = clientToServer.player.game.board.pieceList.pieces;
    const clientPieces = serverToClient.game.board.pieceList.pieces;

    expect(serverPieces).toEqual(clientPieces);
  });

  test('game over', () => {
    clientToServer.startGame();

    expect(serverToClient.game.gameStatus).toBe(true);
    
    const gameOverData = {
      id: clientToServer.player.id,
      board: clientToServer.player.game.board.grid
    }

    clientToServer.gameServer.gameOver(gameOverData);

    expect(serverToClient.game.gameStatus).toBe(null);
    expect(serverToClient.game.animationId).toBe(undefined);
  });

  test('execute commands', () => {
    clientToServer.startGame();

    serverToClient.game.command(CONTROLS.DOWN);
    serverToClient.game.command(CONTROLS.LEFT);
    serverToClient.game.command(CONTROLS.ROTATE_RIGHT);
    serverToClient.game.command(CONTROLS.AUTO_DOWN);
    serverToClient.game.command(CONTROLS.HARD_DROP);

    const serverBoard = clientToServer.player.game.board.grid;
    const clientBoard = serverToClient.game.board.grid;
    expect(serverBoard).toEqual(clientBoard);
    
    serverToClient.game.command(CONTROLS.LEFT);
    serverToClient.game.command(CONTROLS.ROTATE_LEFT);
    serverToClient.game.command(CONTROLS.HARD_DROP);
    
    expect(serverBoard).toEqual(clientBoard);
    expect(clientToServer.player.game.score).toEqual(serverToClient.game.score);
  });

  test('execute commands - player 2 board updates on player 1 DOM', () => {    
    clientToServer.gameServer.join(player2);

    const drawBoardSpy = jest.spyOn(serverToClient.gameDOM.gameView, 'drawBoard');

    clientToServer.startGame();

    expect(drawBoardSpy).toHaveBeenCalledTimes(1);
    
    player2.game.board.grid = getTestBoard('pattern1');
    player2.game.executeCommandQueue([]);
    
    expect(drawBoardSpy).toHaveBeenCalledTimes(2);
  });

  test('game over from play', () => {
    clientToServer.startGame();

    for(let i = 0; i < 25; i++) {
      serverToClient.game.command(CONTROLS.HARD_DROP);
    }

    const serverBoard = clientToServer.player.game.board.grid;
    const clientBoard = serverToClient.game.board.grid;

    expect(serverBoard).toEqual(clientBoard);


    expect(serverToClient.game.gameStatus).toBe(null);
    expect(clientToServer.player.game.gameStatus).toBe(null);

  });

  test('close', () => {
    // this would be caused by player closing their browser or leaving the page
    clientToServer.startGame();

    serverToClient.game.command(CONTROLS.DOWN);
    serverToClient.game.command(CONTROLS.LEFT);
    serverToClient.game.command(CONTROLS.ROTATE_RIGHT);
    serverToClient.game.command(CONTROLS.AUTO_DOWN);
    serverToClient.game.command(CONTROLS.HARD_DROP);

    const serverBoard = clientToServer.player.game.board.grid;
    const clientBoard = serverToClient.game.board.grid;

    expect(serverBoard).toEqual(clientBoard);

    clientToServer.player.leave();

    expect(GAMES.has(clientToServer.gameServer.id)).toBe(false);
  })
});