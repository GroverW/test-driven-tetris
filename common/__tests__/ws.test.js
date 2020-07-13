const Player = require('backend/js/Player');
const Api = require('frontend/helpers/Api');

const serverPubSub = require('backend/helpers/pubSub');

const { CONTROLS } = require('frontend/helpers/clientConstants');
const {
  GAMES, GAME_TYPES, POWER_UP_TYPES, COUNTDOWN,
} = require('backend/helpers/serverConstants');
const { MSG_TYPE } = require('common/helpers/commonTopics');

const {
  getMockDOMSelector, getMockGameDOMSelectors, runCommand, mockAnimation,
} = require('frontend/mockData/mocks');
const MockClientListener = require('common/mockData/mockClientListener');
const MockServerListener = require('common/mockData/mockServerListener');
const {
  mockSend, getTestBoard, webSocketMock, pubSubMock,
} = require('common/mockData/mocks');
const { sendMessage } = require('backend/helpers/serverUtils');

const startGame = (serverListener, ...additionalPlayers) => {
  additionalPlayers.forEach((player) => serverListener.gameServer.join(player));

  serverListener.startGame();
  jest.advanceTimersByTime(COUNTDOWN.NUM_INTERVALS * COUNTDOWN.INTERVAL_LENGTH);
};

const getNewListeners = (clientListener, serverListener) => {
  if (clientListener !== undefined) clientListener.unsubAll();
  if (serverListener !== undefined) serverListener.unsubAll();

  const newClientListener = new MockClientListener(webSocketMock, getMockGameDOMSelectors());
  const newServerListener = new MockServerListener(webSocketMock, 1);

  return [newClientListener, newServerListener];
};

const getNewPlayer = () => new Player(mockSend, serverPubSub());

const resetAll = (clientListener, serverListener, ...players) => {
  const [newClient, newServer] = getNewListeners(clientListener, serverListener);

  newServer.open();

  players.map(() => getNewPlayer());

  startGame(newServer, ...players);

  return [newClient, newServer, ...players];
};

describe('websocket tests', () => {
  let p2;
  let clientListener;
  let serverListener;
  let pubSubSpy;
  let api;

  beforeAll(() => {
    api = new Api(webSocketMock, 1);

    ([clientListener, serverListener] = getNewListeners(clientListener, serverListener));

    p2 = getNewPlayer();
  });

  beforeEach(() => {
    WebSocket = jest.fn().mockImplementation(webSocketMock);
    api.sendMessage = jest.fn().mockImplementation(webSocketMock.send);

    pubSubSpy = pubSubMock();

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);

    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribeAll();
  });

  afterAll(() => {
    clientListener.unsubAll();
    serverListener.unsubAll();
    api.unsubscribe();
    GAMES.clear();
  });

  describe('joining / leaving game', () => {
    test('player opens WS connection', () => {
      serverListener.open();
      expect(serverListener.player).toEqual(expect.any(Player));
    });

    test('second player is added to room', () => {
      const sendAllSpy = jest.spyOn(serverListener.gameServer, 'sendAll');
      const sendSpy = jest.spyOn(p2, 'send');

      // no additional players
      expect(clientListener.gameDOM.players.length).toBe(0);
      expect(clientListener.game.players.length).toBe(0);
      expect(sendAllSpy).toHaveBeenCalledTimes(0);
      expect(sendSpy).toHaveBeenCalledTimes(0);

      serverListener.gameServer.join(p2);

      // one additional player
      expect(clientListener.gameDOM.players.length).toBe(1);
      expect(clientListener.game.players.length).toBe(1);

      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      // player joining should receive all other players in game
      // 1 call for sendAll, 1 to send p1 info to p2
      expect(sendSpy).toHaveBeenCalledTimes(2);
    });

    test('second player is removed from room', () => {
      expect(clientListener.gameDOM.players.length).toBe(1);
      expect(clientListener.gameDOM.gameView.players.length).toBe(1);
      expect(clientListener.game.players.length).toBe(1);

      p2.leave();

      expect(clientListener.gameDOM.players.length).toBe(0);
      expect(clientListener.gameDOM.gameView.players.length).toBe(0);
      expect(clientListener.game.players.length).toBe(0);
    });
  });

  describe('game start / game over', () => {
    test('should start game when initiated by client and add pieces to client and server', () => {
      const drawSpy = pubSubSpy.add('draw');

      // user will click button which will send newGame to server
      expect(clientListener.game.gameStatus).toBe(false);

      startGame(serverListener, p2);

      const serverPieces = serverListener.player.game.board.pieceList.pieces;
      const clientPieces = clientListener.game.board.pieceList.pieces;

      expect(clientPieces).not.toEqual([]);
      expect(serverPieces).toEqual(clientPieces);

      expect(serverListener.gameServer.gameStarted).toBe(true);
      expect(clientListener.game.gameStatus).toBe(true);
      expect(drawSpy).toHaveBeenCalledTimes(1);
    });

    test('subsequent game starts should fail', () => {
      const getPiecesSpy = jest.spyOn(clientListener.game.board, 'getPieces');

      expect(getPiecesSpy).toHaveBeenCalledTimes(0);

      startGame(serverListener, p2);

      expect(getPiecesSpy).toHaveBeenCalledTimes(0);
    });

    test('game over', () => {
      expect(clientListener.gameDOM.message.children.length).toBe(0);
      expect(clientListener.game.gameStatus).toBe(true);
      expect(clientListener.gameLoop.animationId).toEqual(expect.any(Number));

      const gameOverData = {
        id: serverListener.player.id,
        board: serverListener.player.game.board.grid,
      };

      serverListener.gameServer.gameOver(gameOverData);

      expect(clientListener.gameDOM.message.children.length).toBeGreaterThan(0);
      expect(clientListener.game.gameStatus).toBe(null);
      expect(clientListener.gameLoop.animationId).toBe(undefined);
    });

    test('game started - remove game after last player leaves', () => {
      // this would be caused by player closing their browser or leaving the page
      ([clientListener, serverListener, p2] = resetAll(clientListener, serverListener, p2));

      const startingClientBoard = JSON.parse(JSON.stringify(clientListener.game.board.grid));

      runCommand(clientListener.game, CONTROLS.DOWN);
      runCommand(clientListener.game, CONTROLS.LEFT);
      runCommand(clientListener.game, CONTROLS.ROTATE_RIGHT);
      runCommand(clientListener.game, CONTROLS.AUTO_DOWN);
      runCommand(clientListener.game, CONTROLS.HARD_DROP);

      const serverBoard = serverListener.player.game.board.grid;
      const clientBoard = clientListener.game.board.grid;

      expect(startingClientBoard).not.toEqual(clientBoard);
      expect(serverBoard).toEqual(clientBoard);

      serverListener.player.leave();
      p2.leave();

      expect(GAMES.has(serverListener.gameServer.id)).toBe(false);
    });
  });

  describe('gameplay', () => {
    test('execute commands', () => {
      ([clientListener, serverListener, p2] = resetAll(clientListener, serverListener, p2));

      const startingClientBoard = JSON.parse(JSON.stringify(clientListener.game.board.grid));

      runCommand(clientListener.game, CONTROLS.DOWN);

      runCommand(clientListener.game, CONTROLS.LEFT);
      runCommand(clientListener.game, CONTROLS.ROTATE_RIGHT);
      runCommand(clientListener.game, CONTROLS.HARD_DROP);

      const serverBoard = serverListener.player.game.board.grid;
      const clientBoard = clientListener.game.board.grid;

      expect(startingClientBoard).not.toEqual(clientBoard);
      expect(serverBoard).toEqual(clientBoard);

      runCommand(clientListener.game, CONTROLS.LEFT);
      runCommand(clientListener.game, CONTROLS.ROTATE_LEFT);
      runCommand(clientListener.game, CONTROLS.HARD_DROP);

      expect(serverBoard).toEqual(clientBoard);
      expect(serverListener.player.game.score).toEqual(clientListener.game.score);
    });

    test('execute commands - player 2 board updates on player 1 DOM', () => {
      const drawGridSpy = jest.spyOn(clientListener.gameDOM.gameView.players[0], 'drawGrid');

      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      p2.game.board.grid = getTestBoard('pattern1');
      p2.game.executeCommandQueue([]);

      expect(drawGridSpy).toHaveBeenCalledTimes(1);
    });

    test('game over from play', () => {
      for (let i = 0; i < 25; i += 1) {
        runCommand(clientListener.game, CONTROLS.HARD_DROP);
      }

      const serverBoard = serverListener.player.game.board.grid;
      const clientBoard = clientListener.game.board.grid;

      expect(serverBoard).toEqual(clientBoard);

      expect(clientListener.game.gameStatus).toBe(null);
      expect(serverListener.player.game.gameStatus).toBe(null);
    });
  });

  describe('power ups', () => {
    test('power up is added to client when rewarded to server', () => {
      Math.random = jest.fn().mockReturnValue(0.9);

      const p3 = getNewPlayer();
      ([
        clientListener,
        serverListener,
        p2,
      ] = resetAll(clientListener, serverListener, p2, p3));

      expect(serverListener.player.game.powerUps.length).toBe(0);
      expect(clientListener.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);

      serverListener.player.game.clearLines(1);

      expect(serverListener.player.game.powerUps.length).toBe(1);
      expect(clientListener.gameDOM.powerUps.filter((p) => p.type).length).toBe(1);
    });

    test('server side updates client side board', () => {
      Math.random = jest.fn().mockReturnValue(0);

      serverListener.player.game.powerUps[0] = POWER_UP_TYPES.SWAP_LINES;

      serverListener.player.game.board.grid = getTestBoard('pattern1');
      clientListener.game.board.grid = getTestBoard('pattern1');
      p2.game.board.grid = getTestBoard('pattern2');

      const serverBoardBefore = serverListener.player.game.board.grid;
      const clientBoardBefore = clientListener.game.board.grid;

      expect(serverBoardBefore).toEqual(getTestBoard('pattern1'));
      expect(clientBoardBefore).toEqual(getTestBoard('pattern1'));

      serverListener.player.game.usePowerUp(p2.id);

      const serverBoardAfter = serverListener.player.game.board.grid;
      const clientBoardAfter = clientListener.game.board.grid;

      expect(serverBoardAfter).toEqual(getTestBoard('empty'));
      expect(clientBoardAfter).toEqual(getTestBoard('empty'));
      expect(p2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));
    });

    test('should not add if single player', () => {
      Math.random = jest.fn().mockReturnValue(0.9);

      serverListener.gameServer.gameType = GAME_TYPES.SINGLE;
      serverListener.player.setGameType(GAME_TYPES.SINGLE);

      clientListener.gameDOM.usePowerUp();
      clientListener.gameDOM.usePowerUp();

      expect(serverListener.player.game.powerUps.length).toBe(0);
      expect(clientListener.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);

      serverListener.player.game.clearLines(1);

      expect(serverListener.player.game.powerUps.length).toBe(0);
      expect(clientListener.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);
    });
  });

  describe('error messages', () => {
    test('send error message', () => {
      const errorSpy = pubSubSpy.add('addMessage');
      const errorText = 'test';

      expect(errorSpy).not.toHaveBeenCalled();
      expect(clientListener.clientMessage.message.innerText).toBe('');

      sendMessage(serverListener.player, MSG_TYPE.ERROR, errorText);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(clientListener.clientMessage.message.innerText).toBe(errorText);
    });

    test('start game - not enough players', () => {
      const errorSpy = pubSubSpy.add('addMessage');

      ([clientListener, serverListener] = getNewListeners(clientListener, serverListener));
      serverListener.open();

      expect(errorSpy).not.toHaveBeenCalled();
      expect(clientListener.clientMessage.message.innerText).toBe('');

      serverListener.startGame();

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(clientListener.clientMessage.message.innerText).not.toBe('');

      serverListener.gameServer.join(p2);

      serverListener.startGame();

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
