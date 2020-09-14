const PlayerApi = require('..');
const Player = require('backend/js/GameRoom/Player');
const { webSocketMock } = require('common/mocks');
const { GAMES, GAME_TYPES } = require('backend/constants');

describe('player api tests', () => {
  let api;

  beforeEach(() => {
    api = new PlayerApi(webSocketMock);
  });

  describe('setup', () => {
    test('creates new PlayerApi with access to websocket', () => {
      expect(api.ws).toBe(webSocketMock);
    });
  });

  describe('join / create / leave game', () => {
    test('creates game of correct type', () => {
      expect(api.player).toBe(undefined);
      expect(GAMES.size).toBe(0);

      api.createGame(GAME_TYPES.MULTI);

      expect(api.player).toEqual(expect.any(Player));
      expect(GAMES.size).toBe(1);
      expect(api.player.game.gameType).toBe(GAME_TYPES.MULTI);
    });

    test('joins game with matching id', () => {

    });

    test('joining / creating while in game leaves current game and creates new player', () => {

    });
  });

  describe('handle actions', () => {
    test('handles close', () => {

    });

    describe('handle message', () => {
      test('handles PLAY', () => {

      });

      test('handles EXECUTE_COMMANDS', () => {

      });
    });
  });
});
