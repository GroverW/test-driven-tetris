const GameServer = require('backend/js/GameServer');
const GameRoom = require('backend/js/GameRoom');
const { GAMES, GAME_TYPES } = require('backend/helpers/serverConstants');

describe('game server tests', () => {
  const testGameRoom = { id: 1 };

  beforeEach(() => {
    GAMES.set(testGameRoom.id, testGameRoom);
  });

  afterEach(() => {
    GAMES.clear();
  });

  describe('get, add, remove games', () => {
    test('gets game if it exists', () => {
      expect(GameServer.getGame(null)).toBe(false);
      expect(GameServer.getGame(testGameRoom.id)).toBe(testGameRoom);
    });

    test('creates a new GameRoom if id does not exist', () => {
      const newId = GameServer.addGame(2, GAME_TYPES.MULTI);
      expect(GameServer.getGame(newId)).toEqual(expect.any(GameRoom));
    });

    test('does not add a new GameRoom if id in use', () => {
      const newId = GameServer.addGame(testGameRoom.id, GAME_TYPES.MULTI);
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
