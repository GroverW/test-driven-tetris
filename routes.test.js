const request = require('supertest');
const GameServer = require('./src/js/GameServer');
const { GAMES, GAME_TYPES } = require('./src/helpers/serverConstants');

const app = require('./app');

describe('Routes tests', () => {
  afterEach(() => {
    GAMES.clear();
  })

  describe('POST game', () => {
    test('returns uuid', async () => {
      const response = await request(app).post('/game/multi');

      expect(response.statusCode).toBe(201);

      expect(response.body.gameId).toEqual(expect.any(String));
    });

    test('creates new game with uuid - multiplayer', async () => {
      expect(GAMES.size).toBe(0);

      const response = await request(app).post('/game/multi');

      expect(response.statusCode).toBe(201);

      expect(response.body.gameId).toEqual(expect.any(String));

      expect(GAMES.size).toBe(1);
      expect(GAMES.get(response.body.gameId).gameType).toBe(GAME_TYPES.MULTI);

      expect(GAMES.get(response.body.gameId)).toEqual(expect.any(GameServer));
    });
    
    test('creates new game with uuid - single player', async () => {
      expect(GAMES.size).toBe(0);

      const response = await request(app).post('/game/single');

      expect(response.statusCode).toBe(201);

      expect(response.body.gameId).toEqual(expect.any(String));

      expect(GAMES.size).toBe(1);
      expect(GAMES.get(response.body.gameId).gameType).toBe(GAME_TYPES.SINGLE);

      expect(GAMES.get(response.body.gameId)).toEqual(expect.any(GameServer));
    });
  });

  describe('GET game', () => {
    test('gets an existing multiplayer game', async () => {
      const gameId = GameServer.addGame(1, GAME_TYPES.MULTI);
      
      expect(GAMES.size).toBe(1);

      const response = await request(app).get(`/game/multi/${gameId}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.gameId).toBe(gameId);
    });

    test('error - game does not exist', async () => {
      const gameId = 1;

      expect(GAMES.size).toBe(0);

      const response = await request(app).get(`/game/multi/${gameId}`);

      expect(response.statusCode).toBe(404);

      expect(response.body.error).toEqual(expect.any(String));
    });

    test('error - game is not multiplayer', async () => {
      const gameId = GameServer.addGame(1, GAME_TYPES.SINGLE);

      expect(GAMES.size).toBe(1);

      const response = await request(app).get(`/game/multi/${gameId}`);

      expect(response.statusCode).toBe(404);

      expect(response.body.error).toEqual(expect.any(String));
    });
  });
});