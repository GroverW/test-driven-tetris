const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/GameRoom/Player');
const { webSocketMock } = require('common/mocks');
const { GAMES, GAME_TYPES } = require('backend/constants');
const { MSG_TYPE, PLAY, EXECUTE_COMMANDS } = require('backend/topics');
const PlayerApi = require('..');

describe('player api tests', () => {
  let api;

  beforeEach(() => {
    api = new PlayerApi(webSocketMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('creates new PlayerApi with access to websocket', () => {
      expect(api.ws).toBe(webSocketMock);
    });
  });

  describe('join / create / leave game', () => {
    test('creates game of correct type', () => {
      expect(GAMES.size).toBe(0);

      api.createGame(GAME_TYPES.MULTI);

      expect(GAMES.size).toBe(1);
      expect(api.player.game.gameType).toBe(GAME_TYPES.MULTI);
    });

    test('sends error if game not created', () => {
      const addGameMock = jest.spyOn(GameServer, 'addGame');
      addGameMock.mockReturnValue(false);
      api.createPlayer();
      api.createPlayer = jest.fn();
      const sendFlashSpy = jest.spyOn(api.player, 'sendFlash');

      api.createGame(GAME_TYPES.MULTI);

      expect(sendFlashSpy).toHaveBeenLastCalledWith(MSG_TYPE.ERROR, expect.any(String));
      addGameMock.mockRestore();
    });

    test('joins game with matching id', () => {
      const gameId = GameServer.addGame(GAME_TYPES.SINGLE);
      const gameRoom = GameServer.getGame(gameId);

      expect(gameRoom.players.count).toBe(0);

      api.joinGame(gameId);

      expect(gameRoom.players.count).toBe(1);
      expect(gameRoom.players.first).toBe(api.player);
    });

    test('joining / creating while in game leaves current game and creates new player', () => {
      const gameId = GameServer.addGame(GAME_TYPES.SINGLE);
      api.joinGame(gameId);

      const firstPlayer = api.player;
      const leaveSpy = jest.spyOn(firstPlayer, 'leave');

      api.createGame(GAME_TYPES.SINGLE);

      expect(leaveSpy).toHaveBeenCalledTimes(1);
      expect(api.player).not.toBe(firstPlayer);
    });
  });

  describe('handle actions', () => {
    test('handles close', () => {
      api.createGame(GAME_TYPES.SINGLE);
      const leaveSpy = jest.spyOn(api.player, 'leave');

      api.leaveCurrentGame();

      expect(leaveSpy).toHaveBeenCalledTimes(1);
    });

    describe('handle message', () => {
      const createMessage = (type, data) => JSON.stringify({ type, data });

      beforeEach(() => {
        api.createGame(GAME_TYPES.SINGLE);
      });

      test('handles PLAY', () => {
        const message = createMessage(PLAY);
        const startGameSpy = jest.spyOn(api.player, 'startGame');

        api.handleMessage(message);

        expect(startGameSpy).toHaveBeenCalledTimes(1);
      });

      test('handles EXECUTE_COMMANDS', () => {
        const message = createMessage(EXECUTE_COMMANDS, []);
        const executeSpy = jest.spyOn(api.player, 'execute');

        api.handleMessage(message);

        expect(executeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
