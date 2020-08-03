const request = require('supertest');
const GameServer = require('backend/js/GameServer');
const GameRoom = require('backend/js/GameRoom');
const Player = require('backend/js/Player');
const { mockSend } = require('common/mockData/mocks');
const { initSocket, destroySocket } = require('common/mockData/wsMocks');
const pubSub = require('backend/helpers/pubSub');
const { GAMES, GAME_TYPES } = require('backend/helpers/serverConstants');

const app = require('./app');

describe('Routes tests', () => {
  afterEach(() => {
    GAMES.clear();
  });

  describe('GET /', () => {
    test('returns good response in html format', async () => {
      const response = await request(app).get('/').expect('content-type', /html/);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST game', () => {
    const createGameTest = async (type) => {
      const urlParam = type === GAME_TYPES.MULTI ? 'multi' : 'single';

      expect(GAMES.size).toBe(0);

      const response = await request(app).post(`/games/${urlParam}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.gameId).toEqual(expect.any(String));

      expect(GAMES.size).toBe(1);
      expect(GAMES.get(response.body.gameId)).toEqual(expect.any(GameRoom));
      expect(GAMES.get(response.body.gameId).gameType).toBe(type);
    };

    test('creates new game with uniqid - multiplayer', createGameTest.bind(null, GAME_TYPES.MULTI));

    test('creates new game with uniqid - single player', createGameTest.bind(null, GAME_TYPES.SINGLE));
  });

  describe('GET game', () => {
    test('gets an existing multiplayer game', async () => {
      const gameId = GameServer.addGame(GAME_TYPES.MULTI);

      expect(GAMES.size).toBe(1);

      const response = await request(app).get(`/games/multi/${gameId}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.gameId).toBe(gameId);
    });

    test('error - game does not exist', async () => {
      const gameId = 1;

      expect(GAMES.size).toBe(0);

      const response = await request(app).get(`/games/multi/${gameId}`);

      expect(response.statusCode).toBe(404);

      expect(response.body.error).toEqual(expect.any(String));
    });

    test('error - game is not multiplayer', async () => {
      const gameId = GameServer.addGame(1, GAME_TYPES.SINGLE);

      expect(GAMES.size).toBe(1);

      const response = await request(app).get(`/games/multi/${gameId}`);

      expect(response.statusCode).toBe(404);

      expect(response.body.error).toEqual(expect.any(String));
    });
  });

  describe('websocket tests', () => {
    let server;

    const addPlayersToRoom = (type, numPlayers) => {
      const id = GameServer.addGame(type);
      const gameRoom = GameServer.getGame(id);
      let count = numPlayers;

      while (count) {
        gameRoom.join(new Player(mockSend(), pubSub()));
        count -= 1;
      }

      return gameRoom;
    };

    beforeAll(() => {
      server = app.listen(3000);
    });

    afterAll(() => {
      server.close();
    });

    afterEach(() => {
      destroySocket();
    });

    test('successfully connects', async () => {
      const id = GameServer.addGame(GAME_TYPES.MULTI);
      const socket = await initSocket(id);
      expect(socket).toEqual(expect.any(Object));
    });

    test('closes connection if invalid id', async () => {
      try {
        await initSocket('');
      } catch (err) {
        expect(err).toEqual(expect.any(Error));
      }
    });

    test('closes connection if game is full', async () => {
      try {
        const { id } = addPlayersToRoom(GAME_TYPES.SINGLE, 1);

        await initSocket(id);
      } catch (err) {
        expect(err).toEqual(expect.any(Error));
      }
    });

    test('closes connection if game is started', async () => {
      try {
        const { id, manager } = addPlayersToRoom(GAME_TYPES.MULTI, 2);
        manager.startGame();

        await initSocket(id);
      } catch (err) {
        expect(err).toEqual(expect.any(Error));
      }
    });
  });
});
