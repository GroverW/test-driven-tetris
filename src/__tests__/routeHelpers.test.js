const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const { GAME_TYPES } = require('common/helpers/constants');
const { PLAY, EXECUTE_COMMANDS } = require('backend/helpers/serverTopics');
const {
  multiGameExists,
  getGameById,
  createGame,
  getNewPlayer,
  closeConnection,
  handleMessage,
  handleClose,
} = require('backend/helpers/routeHelpers');

describe('route helper tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get game', () => {
    let gameServerSingle;
    let gameServerMulti;
    let id1;
    let id2;

    beforeEach(() => {
      id1 = GameServer.addGame(GAME_TYPES.SINGLE);
      id2 = GameServer.addGame(GAME_TYPES.MULTI);
      gameServerSingle = GameServer.getGame(id1);
      gameServerMulti = GameServer.getGame(id2);
    });

    describe('multiplayer game exists', () => {
      test('returns true if valid game', () => {
        expect(multiGameExists(id2)).toBe(true);
      });

      test('returns false if single player game', () => {
        expect(multiGameExists(id1)).toBe(false);
      });

      test('returns false if no game found', () => {
        expect(multiGameExists(null)).toBe(false);
      });
    });

    describe('get game by id', () => {
      test('gets game if valid id', () => {
        expect(getGameById(id1)).toBe(gameServerSingle);
        expect(getGameById(id2)).toBe(gameServerMulti);
      });

      test('returns false if not found', () => {
        expect(getGameById(null)).toBe(false);
      });
    });
  });

  describe('create game', () => {
    test('creates game of type given', () => {
      const newGameId = createGame(GAME_TYPES.SINGLE);
      expect(getGameById(newGameId).gameType).toBe(GAME_TYPES.SINGLE);
    });
  });

  describe('get new player', () => {
    test('gets new player', () => {
      const mockWs = { send: jest.fn() };

      const player = getNewPlayer(mockWs);
      expect(player).toEqual(expect.any(Player));
    });
  });

  describe('close connection', () => {
    test('closes websocket and throws error', () => {
      const mockWs = { close: jest.fn() };
      const testMessage = 'message';

      expect(() => closeConnection(mockWs, testMessage)).toThrow(Error);
      expect(mockWs.close).toHaveBeenLastCalledWith(1008, testMessage);
    });
  });

  describe('handle message / close', () => {
    let player;
    let processMessage;
    const createTestMessage = (type, data) => JSON.stringify({ type, data });

    beforeEach(() => {
      const mockWs = { send: jest.fn() };
      player = getNewPlayer(mockWs);
      processMessage = handleMessage(player);
    });

    test('PLAY calls startGame', () => {
      const startGameSpy = jest.spyOn(player, 'startGame');
      processMessage(createTestMessage(PLAY));
      expect(startGameSpy).toHaveBeenCalledTimes(1);
    });

    test('EXECUTE_COMMANDS executes command queue', () => {
      const commandQueueSpy = jest.spyOn(player.game, 'executeCommandQueue');
      const testCommands = ['test'];

      processMessage(createTestMessage(EXECUTE_COMMANDS, testCommands));
      expect(commandQueueSpy).toHaveBeenCalledTimes(1);
      expect(commandQueueSpy).toHaveBeenLastCalledWith(testCommands);
    });

    test('handles close', () => {
      const leaveSpy = jest.spyOn(player, 'leave');

      const closeWs = handleClose(player);

      closeWs();

      expect(leaveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
