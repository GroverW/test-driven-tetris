const request = require('supertest');
const GameServer = require('./src/js/gameServer');
const { GAMES, GAME_TYPES } = require('./src/helpers/data');

const app = require('./app');

describe('Routes tests', () => {
  afterEach(() => {
    GAMES.clear();
  })

  describe('GET game', () => {
    test('Returns uuid', async () => {
      const response = await request(app).get('/game/multi');

      expect(response.statusCode).toBe(200);

      expect(response.body.gameId).toEqual(expect.any(String));
    });

    test('Creates new game with uuid - multiplayer', async () => {
      expect(GAMES.size).toBe(0);

      const response = await request(app).get('/game/multi');

      expect(response.statusCode).toBe(200);

      expect(response.body.gameId).toEqual(expect.any(String));

      expect(GAMES.size).toBe(1);
      expect(GAMES.get(response.body.gameId).gameType).toBe(GAME_TYPES.MULTI);

      expect(GAMES.get(response.body.gameId)).toEqual(expect.any(GameServer));
    });
    
    test('Creates new game with uuid - single player', async () => {
      expect(GAMES.size).toBe(0);

      const response = await request(app).get('/game/single');

      expect(response.statusCode).toBe(200);

      expect(response.body.gameId).toEqual(expect.any(String));

      expect(GAMES.size).toBe(1);
      expect(GAMES.get(response.body.gameId).gameType).toBe(GAME_TYPES.SINGLE);

      expect(GAMES.get(response.body.gameId)).toEqual(expect.any(GameServer));
    });
  });
});