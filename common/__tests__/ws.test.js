const Player = require('backend/js/player');
const { Piece } = require('common/js/piece');
const ClientGame = require('frontend/static/js/clientGame');
const Api = require('frontend/helpers/api');

const serverPubSub = require('backend/helpers/pubSub');

const { CONTROLS } = require('frontend/helpers/clientConstants');
const { GAMES, GAME_TYPES, POWER_UP_TYPES, PIECE_TYPES } = require("backend/helpers/serverConstants");

const { getMockCtx, getMockDOMSelector, pubSubMocks } = require("frontend/mockData/mocks");
const { MockServerListener, MockClientListener } = require("common/mockData/mockWSListeners");
const { mockSend, getTestBoard, webSocketMock } = require('common/mockData/mocks');


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
      score: getMockDOMSelector(),
      level: getMockDOMSelector(),
      lines: getMockDOMSelector(),
      player: getMockDOMSelector(),
      powerUps: [getMockDOMSelector(), getMockDOMSelector()],
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
    expect(serverToClient.game.players.length).toBe(0);
    expect(sendAllSpy).toHaveBeenCalledTimes(0);
    expect(sendToSpy).toHaveBeenCalledTimes(0);

    clientToServer.gameServer.join(player2);

    // one additional player
    expect(serverToClient.gameDOM.players.length).toBe(1);
    expect(serverToClient.game.players.length).toBe(1);

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
    expect(serverToClient.game.players.length).toBe(1);

    player2.leave();

    expect(serverToClient.gameDOM.players.length).toBe(0);
    expect(serverToClient.gameDOM.gameView.players.length).toBe(0);
    expect(serverToClient.game.players.length).toBe(0);
  });

  test('game start - initiated by client', () => {
    clientToServer.gameServer.join(player2);
    // user will click button which will send newGame to server
    expect(serverToClient.game.gameStatus).toBe(false);

    clientToServer.startGame();

    expect(clientToServer.gameServer.gameStarted).toBe(true);
    expect(serverToClient.game.gameStatus).toBe(true);
    expect(pubSub.drawMock).toHaveBeenCalledTimes(1);
  });

  test('game start - subsequent game starts should fail', () => {
    clientToServer.gameServer.join(player2);
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
    clientToServer.gameServer.join(player2);
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
    clientToServer.gameServer.join(player2);
    clientToServer.startGame();

    for (let i = 0; i < 25; i++) {
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
  });

  test('power up - server side updates client side board', () => {
    let player3 = new Player(mockSend, serverPubSub());
    clientToServer.gameServer.join(player2);
    clientToServer.gameServer.join(player3);

    clientToServer.player.game.addPowerUp(POWER_UP_TYPES.SWAP_LINES);

    clientToServer.startGame();

    clientToServer.player.game.board.grid = getTestBoard('pattern1');
    serverToClient.game.board.grid = getTestBoard('pattern1');
    player2.game.board.grid = getTestBoard('pattern2');

    const serverBoardBefore = clientToServer.player.game.board.grid;
    const clientBoardBefore = serverToClient.game.board.grid;

    expect(serverBoardBefore).toEqual(getTestBoard('pattern1'));
    expect(clientBoardBefore).toEqual(getTestBoard('pattern1'));

    clientToServer.player.game.usePowerUp(player2.id);

    const serverBoardAfter = clientToServer.player.game.board.grid;
    const clientBoardAfter = serverToClient.game.board.grid;

    expect(serverBoardAfter).toEqual(getTestBoard('empty'));
    expect(clientBoardAfter).toEqual(getTestBoard('empty'));
    expect(player2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));
  });

  test('power up - power up is added to client when rewarded to server', () => {
    Math.random = jest.fn().mockReturnValue(.9);
    clientToServer.gameServer.join(player2);
    clientToServer.startGame();

    clientToServer.player.game.board.grid = getTestBoard('clearLines2');
    clientToServer.player.game.board.piece = new Piece(PIECE_TYPES.T);
    clientToServer.player.game.board.nextPiece = new Piece(PIECE_TYPES.I);

    const COMMANDS2 = [
      'ROTATE_LEFT',
      'ROTATE_LEFT',
      'LEFT',
      'LEFT',
      'HARD_DROP',
      'ROTATE_LEFT',
      'HARD_DROP',
    ];

    expect(clientToServer.player.game.powerUps.length).toBe(0);
    expect(serverToClient.gameDOM.powerUps.filter(p => p.type).length).toBe(0);

    clientToServer.player.game.executeCommandQueue(COMMANDS2);

    expect(clientToServer.player.game.powerUps.length).toBe(1);
    expect(serverToClient.gameDOM.powerUps.filter(p => p.type).length).toBe(1);
  });

  test('power up - should not add if single player', () => {
    Math.random = jest.fn().mockReturnValue(.9);
    clientToServer.gameServer.gameType = GAME_TYPES.SINGLE;
    clientToServer.player.setGameType(GAME_TYPES.SINGLE);
    clientToServer.startGame();

    clientToServer.player.game.board.grid = getTestBoard('clearLines2');
    clientToServer.player.game.board.piece = new Piece(PIECE_TYPES.T);
    clientToServer.player.game.board.nextPiece = new Piece(PIECE_TYPES.I);

    const COMMANDS2 = [
      'ROTATE_LEFT',
      'ROTATE_LEFT',
      'LEFT',
      'LEFT',
      'HARD_DROP',
      'ROTATE_LEFT',
      'HARD_DROP',
    ];

    expect(clientToServer.player.game.powerUps.length).toBe(0);
    expect(serverToClient.gameDOM.powerUps.filter(p => p.type).length).toBe(0);

    clientToServer.player.game.executeCommandQueue(COMMANDS2);

    expect(clientToServer.player.game.powerUps.length).toBe(0);
    expect(serverToClient.gameDOM.powerUps.filter(p => p.type).length).toBe(0);
  });
});