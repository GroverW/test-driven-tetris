const uniqid = require('uniqid');

const GameRoom = require('backend/js/GameRoom');
const { GAMES, GAME_TYPES } = require('backend/constants');
const GameServer = require('backend/js/GameServer');

jest.mock('uniqid');

describe('game server tests', () => {
  const testGameRoom = { id: 1 };

  beforeEach(() => {
    GAMES.set(testGameRoom.id, testGameRoom);
  });

  afterEach(() => {
    GAMES.clear();
    jest.clearAllMocks();
  });

  describe('get, add, remove games', () => {
    test('gets game if it exists', () => {
      expect(GameServer.getGame(null)).toBe(false);
      expect(GameServer.getGame(testGameRoom.id)).toBe(testGameRoom);
    });

    test('creates a new GameRoom if id does not exist', () => {
      const newId = GameServer.addGame(GAME_TYPES.MULTI);
      expect(GameServer.getGame(newId)).toEqual(expect.any(GameRoom));
    });

    test('does not add a new GameRoom if id in use', () => {
      uniqid.mockImplementation(() => testGameRoom.id);
      const newId = GameServer.addGame(GAME_TYPES.MULTI);
      expect(GameServer.getGame(newId)).not.toEqual(expect.any(GameRoom));
      expect(GameServer.getGame(newId)).toBe(testGameRoom);
    });

    test('removes game room if id mataches', () => {
      expect(GameServer.removeGame(null)).toBe(false);
      expect(GameServer.removeGame(testGameRoom.id)).toBe(true);
      expect(GameServer.getGame(testGameRoom.id)).toBe(false);
    });
  });
});
