const GameRoom = require('backend/js/GameRoom');
const PlayerManager = require('backend/js/PlayerManager');
const GameManager = require('backend/js/GameManager');
const Player = require('backend/js/Player');
const { mockSend } = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');
const { GAME_TYPES } = require('backend/helpers/serverConstants');
const {
  MSG_TYPE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  PLAY,
  GAME_OVER,
  ADD_PIECES,
  UPDATE_PLAYER,
  ADD_POWER_UP,
  USE_POWER_UP
} = require('backend/helpers/serverTopics');

describe('game room tests', () => {
  let gameRoom;
  let p1; let p2; let p3; let p4; let p5;

  beforeEach(() => {
    gameRoom = new GameRoom(GAME_TYPES.MULTI, jest.fn());
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

    describe('remove player', () => {
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

      test('removes subscriptions and returns true if player removed successfully', () => {
        const removeSubscriptionsSpy = jest.spyOn(gameRoom, 'removeSubscriptions');
        const removeFromRoomSpy = jest.spyOn(gameRoom, 'removeFromRoom');

        expect(gameRoom.removePlayer(p3)).toBe(true);

        expect(removeSubscriptionsSpy).toHaveBeenCalledTimes(1);
        expect(removeFromRoomSpy).toHaveBeenCalledTimes(1);
      });

      test('returns false if player not removed from room', () => {
        gameRoom.removeFromRoom = jest.fn().mockReturnValue(false);
        expect(gameRoom.removePlayer(p3)).toBe(false);
      });
    });

    describe('leave room steps', () => {
      test('syncPlayersWith removes player if player doesn\t exist', () => {
        const sendAllSpy = jest.spyOn(gameRoom.manager.msg, 'sendAll');

        gameRoom.players.remove(p2);
        gameRoom.syncPlayersWith(p2);

        expect(sendAllSpy).toHaveBeenLastCalledWith({ type: REMOVE_PLAYER, data: p2.id });
      });

      test('removes player, syncs players, checks for winner and returns true', () => {
        const removePlayerSpy = jest.spyOn(gameRoom, 'removePlayer');
        const syncPlayersWithSpy = jest.spyOn(gameRoom, 'syncPlayersWith');
        const checkIfWinnerAndEndGameSpy = jest.spyOn(gameRoom.manager, 'checkIfWinnerAndEndGame');

        expect(gameRoom.leave(p1)).toBe(true);

        expect(removePlayerSpy).toHaveBeenCalledTimes(1);
        expect(syncPlayersWithSpy).toHaveBeenCalledTimes(1);
        expect(checkIfWinnerAndEndGameSpy).toHaveBeenCalledTimes(1);
      });

      test('returns false if player not removed', () => {
        gameRoom.removePlayer = jest.fn().mockReturnValue(false);
        expect(gameRoom.leave(p1)).toBe(false);
      });

      test('endGame called if winner', () => {
        const endGameSpy = jest.spyOn(gameRoom.manager, 'endGame');

        gameRoom.manager.checkIfWinner = jest.fn().mockReturnValue(true);

        gameRoom.leave(p1);

        expect(endGameSpy).toHaveBeenCalledTimes(1);
      });

      test('calls remove game room if no players remaining', () => {
        [p1, p2, p3].forEach((p) => gameRoom.leave(p));

        expect(gameRoom.removeGameRoom).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('publish / subscribe', () => {
    let mockFunction;

    const runPubSubTestFor = (player, topic) => {
      gameRoom.join(player);
      player.pubSub.publish(topic, '');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    };

    beforeEach(() => {
      mockFunction = jest.fn();
    });

    test('REMOVE_PLAYER calls leave', () => {
      gameRoom.leave = () => mockFunction();
      runPubSubTestFor(p1, REMOVE_PLAYER);
    });

    test('PLAY calls playerReady', () => {
      gameRoom.manager.playerReady = () => mockFunction();
      runPubSubTestFor(p1, PLAY);
    });

    test('GAME_OVER calls game over for player', () => {
      gameRoom.manager.gameOver = () => mockFunction();
      runPubSubTestFor(p1, GAME_OVER);
    });

    test('GET_PIECES calls add pieces', () => {
      gameRoom.manager.getPieces = () => mockFunction();
      runPubSubTestFor(p1, ADD_PIECES);
    });

    test('UPDATE_PLAYER sends player update to others', () => {
      gameRoom.manager.msg.sendPlayerUpdateToOthers = () => mockFunction();
      runPubSubTestFor(p1, UPDATE_PLAYER);
    });

    test('ADD_POWER_UP adds power up for player', () => {
      gameRoom.manager.msg.sendPowerUp = () => mockFunction();
      runPubSubTestFor(p1, ADD_POWER_UP);
    });

    test('USE_POWER_UP executes power up', () => {
      gameRoom.manager.executePowerUp = () => mockFunction();
      runPubSubTestFor(p1, USE_POWER_UP);
    });

    test('unsubscribe removes all subscriptions', () => {
      p1.pubSub.subscribe = jest.fn().mockImplementation(() => mockFunction);
      gameRoom.join(p1);

      expect(mockFunction).toHaveBeenCalledTimes(0);
      gameRoom.unsubscribe();
      expect(Object.keys(gameRoom.subscriptions).length).toBe(0);
      expect(mockFunction).toHaveBeenCalledTimes(7);
    });
  });
});
