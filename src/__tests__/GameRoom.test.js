const GameRoom = require('backend/js/GameRoom');
const PlayerManager = require('backend/js/PlayerManager');
const GameManager = require('backend/js/GameManager');
const Player = require('backend/js/Player');
const { mockSend } = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');
const { GAME_TYPES } = require('backend/helpers/serverConstants');

describe('game room tests', () => {
  let gameRoom;
  let p1; let p2; let p3; let p4; let p5;

  beforeEach(() => {
    gameRoom = new GameRoom(GAME_TYPES.MULTI);
    ([p1, p2, p3, p4, p5] = [p1, p2, p3, p4, p5].map(() => new Player(mockSend(), pubSub())));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setup', () => {
    expect(gameRoom.players).toEqual(expect.any(PlayerManager));
    expect(gameRoom.manager).toEqual(expect.any(GameManager));
    expect(gameRoom.gameType).toBe(GAME_TYPES.MULTI);
  });

  describe('join room', () => {
    describe('check room status', () => {
      beforeEach(() => {
        gameRoom.players.add(p1);
      });

      test('returns true if game not full and not started', () => {
        expect(gameRoom.roomAvailable()).toBe(true);
      });

      test('returns false and sends error if room full', () => {

      });

      test('returns false and sends error if game started', () => {

      });
    });

    describe('join room steps', () => {
      test('adds player subscriptions', () => {

      });

      test('returns true if check room conditions met', () => {

      });

      test('returns false if check room conditions not met', () => {

      });
    });
  });

  describe('leave room', () => {

  });

  describe('publish / subscribe', () => {

  });
});
