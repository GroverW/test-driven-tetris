const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/GameRoom/Player');
const Api = require('frontend/helpers/Api');

const serverPubSub = require('backend/helpers/pubSub');

const { CONTROLS } = require('frontend/constants');
const {
  GAMES, GAME_TYPES, POWER_UP_TYPES, COUNTDOWN,
} = require('backend/constants');
const { MSG_TYPE } = require('common/topics');

const {
  getMockDOMSelector, getMockGameDOMSelectors, runCommands, mockAnimation,
} = require('frontend/mocks');
const MockClientListener = require('common/mocks/ClientListener');
const MockServerListener = require('common/mocks/ServerListener');
const {
  mockSend, getTestBoard, webSocketMock, pubSubMock,
} = require('common/mocks');

const startGame = (serverListener, ...additionalPlayers) => {
  additionalPlayers.forEach((player) => serverListener.gameRoom.join(player));

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

const getNewPlayer = () => new Player(mockSend(), serverPubSub());

const initialize = (serverListener, ...players) => {
  serverListener.open();

  startGame(serverListener, ...players);
};

describe('websocket tests', () => {
  let p2; let p3;
  let client;
  let server;
  let pubSubSpy;
  let api;

  beforeEach(() => {
    api = new Api(webSocketMock, 1);

    ([client, server] = getNewListeners(client, server));

    p2 = getNewPlayer();
    p3 = getNewPlayer();

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
    pubSubSpy.unsubscribe();
    client.unsubAll();
    server.unsubAll();
    api.unsubscribe();
    GAMES.clear();
  });

  describe('joining / leaving game', () => {
    beforeEach(() => {
      server.open();
    });

    test('player opens WS connection', () => {
      expect(server.player).toEqual(expect.any(Player));
    });

    test('second player is added to room', () => {
      const syncPlayersSpy = jest.spyOn(server.gameRoom, 'syncPlayersWith');
      const sendSpy = jest.spyOn(p2, 'send');

      expect(client.getProp('numPlayers')).toEqual([0, 0, 0]);
      expect(syncPlayersSpy).toHaveBeenCalledTimes(0);
      expect(sendSpy).toHaveBeenCalledTimes(0);

      server.gameRoom.join(p2);

      expect(client.getProp('numPlayers')).toEqual([1, 1, 1]);

      expect(syncPlayersSpy).toHaveBeenCalledTimes(1);
      // player joining should receive all other players in game
      // 1 call for sendAll, 1 to send p1 info to p2, 1 to update players waiting message
      expect(sendSpy).toHaveBeenCalledTimes(3);
    });

    test('second player is removed from room', () => {
      server.gameRoom.join(p2);

      expect(client.getProp('numPlayers')).toEqual([1, 1, 1]);

      p2.leave();

      expect(client.getProp('numPlayers')).toEqual([0, 0, 0]);
    });

    test('client closes window should remove player from server', () => {
      client.closeWindow();
      expect(server.getProp('numPlayers')).toBe(0);
      expect(GameServer.getGame(server.gameRoom.id)).toBe(false);
    });
  });

  describe('game start / game over', () => {
    test('should start game when initiated by client and add pieces to client and server', () => {
      server.open();
      const drawSpy = pubSubSpy.add('draw');

      // user will click button which will send newGame to server
      expect(client.getProp('gameStatus')).toBe(false);

      startGame(server, p2);

      expect(client.getProp('pieces')).not.toEqual([]);
      expect(server.getProp('pieces')).toEqual(client.getProp('pieces'));

      expect(server.getProp('gameStarted')).toBe(true);
      expect(client.getProp('gameStatus')).toBe(true);
      expect(drawSpy).toHaveBeenCalledTimes(1);
    });

    test('subsequent game starts should fail', () => {
      initialize(server, p2);

      const getPiecesSpy = jest.spyOn(client.game.board, 'getPieces');

      expect(getPiecesSpy).toHaveBeenCalledTimes(0);

      startGame(server, p2);

      expect(getPiecesSpy).toHaveBeenCalledTimes(0);
    });

    test('game over', () => {
      initialize(server, p2);
      expect(client.getProp('messagePresent')).toBe(false);
      expect(client.getProp('gameStatus')).toBe(true);
      expect(client.gameLoop.animationId).toEqual(expect.any(Number));

      const gameOverData = {
        id: server.player.id,
        board: server.player.game.board.grid,
      };

      server.gameRoom.manager.gameOver(gameOverData);

      expect(client.getProp('messagePresent')).toBe(true);
      expect(client.getProp('gameStatus')).toBe(null);
      expect(client.gameLoop.animationId).toBe(undefined);
    });

    test('game started - remove game after last player leaves', () => {
      initialize(server, p2);
      const startingClientBoard = client.getProp('board');

      const {
        DOWN, LEFT, ROTATE_RIGHT, AUTO_DOWN, HARD_DROP,
      } = CONTROLS;
      runCommands(client.game, DOWN, LEFT, ROTATE_RIGHT, AUTO_DOWN, HARD_DROP);

      expect(startingClientBoard).not.toEqual(client.getProp('board'));
      expect(server.getProp('board')).toEqual(client.getProp('board'));

      server.player.leave();
      p2.leave();

      expect(GameServer.getGame(server.gameRoom.id)).toBe(false);
    });
  });

  describe('gameplay', () => {
    beforeEach(() => {
      initialize(server, p2);
    });

    test('execute commands', () => {
      const startingClientBoard = client.getProp('board');

      const {
        DOWN, LEFT, ROTATE_LEFT, ROTATE_RIGHT, HARD_DROP,
      } = CONTROLS;
      runCommands(client.game, DOWN, LEFT, ROTATE_RIGHT, HARD_DROP);

      expect(startingClientBoard).not.toEqual(client.getProp('board'));
      expect(server.getProp('board')).toEqual(client.getProp('board'));

      runCommands(client.game, LEFT, ROTATE_LEFT, HARD_DROP);

      expect(server.getProp('board')).toEqual(client.getProp('board'));
      expect(server.getProp('score')).toEqual(client.getProp('score'));
    });

    test('execute commands - player 2 board updates on player 1 DOM', () => {
      const drawGridSpy = jest.spyOn(client.gameDOM.gameView.players[0], 'drawGrid');

      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      p2.game.board.grid = getTestBoard('pattern1');
      p2.game.executeCommandQueue([]);

      expect(drawGridSpy).toHaveBeenCalledTimes(1);
    });

    test('game over from play', () => {
      const commands = new Array(25).fill(CONTROLS.HARD_DROP);
      runCommands(client.game, ...commands);

      expect(server.getProp('board')).toEqual(client.getProp('board'));

      expect(client.getProp('gameStatus')).toBe(null);
      expect(server.getProp('gameStatus')).toBe(null);
    });
  });

  describe('power ups', () => {
    test('power up is added to client when rewarded to server', () => {
      Math.random = jest.fn().mockReturnValue(0.9);

      initialize(server, p2, p3);

      expect(server.getProp('numPowerUps')).toBe(0);
      expect(client.getProp('numPowerUps')).toBe(0);

      server.player.game.clearLines(1);

      expect(server.getProp('numPowerUps')).toBe(1);
      expect(client.getProp('numPowerUps')).toBe(1);
    });

    test('server side updates client side board', () => {
      initialize(server, p2);

      Math.random = jest.fn().mockReturnValue(0);

      server.player.game.powerUps[0] = POWER_UP_TYPES.SWAP_LINES;

      server.player.game.board.grid = getTestBoard('pattern1');
      client.game.board.grid = getTestBoard('pattern1');
      p2.game.board.grid = getTestBoard('pattern2');

      expect(server.getProp('board')).toEqual(getTestBoard('pattern1'));
      expect(client.getProp('board')).toEqual(getTestBoard('pattern1'));

      server.player.game.usePowerUp(p2.id);

      expect(server.getProp('board')).toEqual(getTestBoard('empty'));
      expect(client.getProp('board')).toEqual(getTestBoard('empty'));
      expect(p2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));
    });

    test('should not add if single player', () => {
      Math.random = jest.fn().mockReturnValue(0.9);

      server.open();
      server.gameRoom.gameType = GAME_TYPES.SINGLE;
      server.player.setGameType(GAME_TYPES.SINGLE);

      client.gameDOM.usePowerUp();
      client.gameDOM.usePowerUp();

      expect(server.getProp('numPowerUps')).toBe(0);
      expect(client.getProp('numPowerUps')).toBe(0);

      server.player.game.clearLines(1);

      expect(server.player.game.powerUps.length).toBe(0);
      expect(client.getProp('numPowerUps')).toBe(0);
    });
  });

  describe('error messages', () => {
    test('send error message', () => {
      const errorSpy = pubSubSpy.add('addMessage');
      const errorText = 'test';

      server.open();

      expect(errorSpy).not.toHaveBeenCalled();
      expect(client.clientMessage.message.innerText).toBe('');

      server.player.sendFlash(MSG_TYPE.ERROR, errorText);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(client.clientMessage.message.innerText).toBe(errorText);
    });

    test('start game - not enough players', () => {
      const errorSpy = pubSubSpy.add('addMessage');

      expect(errorSpy).not.toHaveBeenCalled();
      expect(client.clientMessage.message.innerText).toBe('');

      initialize(server);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
      expect(client.clientMessage.message.innerText).not.toBe('');

      server.gameRoom.join(p2);

      server.startGame();

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
