const GameRoom = require('backend/js/GameRoom');
const PlayerManager = require('backend/js/PlayerManager');
const GameManager = require('backend/js/GameManager');
const Player = require('backend/js/Player');
const { mockSend } = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');
const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { MSG_TYPE, ADD_PLAYER } = require('backend/helpers/serverTopics');

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
    expect(gameRoom.nextPlayerId).toBe(1);
  });

  describe('join room', () => {
    describe('check room status', () => {
      beforeEach(() => {
        gameRoom.players.add(p1);
      });

      test('returns true if game not full and not started', () => {
        expect(gameRoom.roomAvailable()).toBe(true);
      });

      test('returns false and sends error if room full - multiplayer', () => {
        const sendFlashSpy = jest.spyOn(p5, 'sendFlash');
        [p2, p3, p4].forEach((p) => gameRoom.players.add(p));
        expect(gameRoom.roomAvailable(p5)).toBe(false);
        expect(sendFlashSpy).toHaveBeenLastCalledWith(MSG_TYPE.ERROR, expect.any(String));
      });

      test('returns false and sends error if room full - single player', () => {
        const sendFlashSpy = jest.spyOn(p2, 'sendFlash');
        gameRoom.gameType = GAME_TYPES.SINGLE;
        expect(gameRoom.roomAvailable(p2)).toBe(false);
        expect(sendFlashSpy).toHaveBeenLastCalledWith(MSG_TYPE.ERROR, expect.any(String));
      });

      test('returns false and sends error if game started', () => {
        const sendFlashSpy = jest.spyOn(p2, 'sendFlash');
        gameRoom.manager.gameStarted = true;
        expect(gameRoom.roomAvailable(p2)).toBe(false);
        expect(sendFlashSpy).toHaveBeenLastCalledWith(MSG_TYPE.ERROR, expect.any(String));
      });
    });

    describe('join room steps', () => {
      test('sets player attributes', () => {
        const setIdSpy = jest.spyOn(p1, 'setId');
        const setGameTypeSpy = jest.spyOn(p1, 'setGameType');
        const nextId = gameRoom.nextPlayerId;

        gameRoom.setPlayerAttributes(p1);

        expect(setIdSpy).toHaveBeenLastCalledWith(nextId);
        expect(setGameTypeSpy).toHaveBeenLastCalledWith(gameRoom.gameType);
        expect(gameRoom.nextPlayerId).toBeGreaterThan(nextId);
      });

      test('adds player subscriptions', () => {
        expect(gameRoom.subscriptions[p2.id]).toBe(undefined);
        gameRoom.addSubscriptions(p2);
        expect(gameRoom.subscriptions[p2.id]).toEqual(expect.any(Array));
      });

      test('syncs players', () => {
        const sendAllSpy = jest.spyOn(gameRoom.manager.msg, 'sendAll');
        const addOtherPlayersToSpy = jest.spyOn(gameRoom.manager.msg, 'addOtherPlayersTo');

        gameRoom.players.add(p2);
        gameRoom.syncPlayersWith(p2);

        expect(sendAllSpy).toHaveBeenLastCalledWith({ type: ADD_PLAYER, data: p2.id });
        expect(addOtherPlayersToSpy).toHaveBeenLastCalledWith(p2);
      });

      test('joining room sets attributes, adds subs, syncs players and returns true', () => {
        const setPlayerAttributesSpy = jest.spyOn(gameRoom, 'setPlayerAttributes');
        const addSubscriptionsSpy = jest.spyOn(gameRoom, 'addSubscriptions');
        const syncPlayersWithSpy = jest.spyOn(gameRoom, 'syncPlayersWith');

        expect(gameRoom.join(p2)).toBe(true);
        expect(gameRoom.players.list.includes(p2)).toBe(true);

        expect(setPlayerAttributesSpy).toHaveBeenCalledTimes(1);
        expect(addSubscriptionsSpy).toHaveBeenCalledTimes(1);
        expect(syncPlayersWithSpy).toHaveBeenCalledTimes(1);
      });

      test('returns false if room available conditions not met', () => {
        gameRoom.roomAvailable = jest.fn().mockReturnValue(false);

        expect(gameRoom.join(p2)).toBe(false);
      });

      test('returns false if unable to add player to room', () => {
        gameRoom.addToRoom = jest.fn().mockReturnValue(false);

        expect(gameRoom.join(p2)).toBe(false);
      });
    });
  });

  describe('leave room', () => {
    beforeEach(() => {
      [p1, p2, p3].forEach((p) => gameRoom.join(p));
    });

    test('removes subscriptions', () => {
      expect(gameRoom.subscriptions[p2.id]).toEqual(expect.any(Array));

      const mockUnsub = jest.fn();
      gameRoom.subscriptions[p2.id].push(mockUnsub);

      gameRoom.removeSubscriptions(p2);

      expect(gameRoom.subscriptions[p2.id]).toBe(undefined);
      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });

    test('removes player from room', () => {
      expect(gameRoom.removeFromRoom(p2)).toBe(true);
      expect(gameRoom.players.getById(p2.id)).toBe(undefined);
    });

  });

  describe('publish / subscribe', () => {

  });
});
