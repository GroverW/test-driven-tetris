const GameManager = require('backend/js/GameManager');
const { GAME_TYPES } = require('common/helpers/constants');

describe('game manager tests', () => {
  let gameManager;
  let p1; let p2;

  beforeEach(() => {
    p1 = {};
    p2 = {};
    gameManager = new GameManager(GAME_TYPES.MULTI);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add / remove players', () => {
    test('adds player', () => {
      expect(gameManager.players.length).toBe(0);

      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);
    });

    test('does not add same player twice', () => {
      gameManager.addPlayer(p1);
      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);
    });

    test('removes player', () => {
      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);

      gameManager.removePlayer(p1);

      expect(gameManager.players.length).toBe(0);
    });

    test('only removes player if player matches', () => {
      gameManager.addPlayer(p1);
      gameManager.removePlayer(p2);

      expect(gameManager.players.length).toBe(1);

      gameManager.removePlayer(p1);

      expect(gameManager.players.length).toBe(0);
    });
  });

  describe('start game', () => {
    describe('check start conditions', () => {
      beforeEach(() => {
        gameManager.addPlayer(p1);
      });

      test('gets total number of players ready', () => {
        expect(gameManager.getTotalReady()).toBe(0);

        p1.readyToPlay = true;

        expect(gameManager.getTotalReady()).toBe(1);
      });

      test('returns true if players ready is == total ready', () => {
        gameManager.addPlayer(p2);

        p1.readyToPlay = true;
        p2.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(true);
      });

      test('returns false if players ready is < total ready', () => {
        gameManager.addPlayer(p2);

        p1.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(false);
      });

      test('sends error if only one player in multiplayer game', () => {
        const sendErrorSpy = jest.spyOn(gameManager, 'sendError');

        p1.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(false);
        expect(sendErrorSpy).toHaveBeenCalledTimes(1);
        expect(sendErrorSpy).toHaveBeenLastCalledWith(expect.any(String));
      });

      test('handles single player game', () => {
        gameManager.gameType = GAME_TYPES.SINGLE;

        expect(gameManager.checkStartConditions()).toBe(false);

        p1.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(true);
      });
    });

    describe('player ready', () => {
      beforeEach(() => {
        gameManager.addPlayer(p1);
        gameManager.addPlayer(p2);
      });

      test('calls animate start if start conditions met', () => {
        const animateStartSpy = jest.spyOn(gameManager, 'animateStart');

        p1.readyToPlay = true;

        gameManager.playerReady();

        expect(animateStartSpy).toHaveBeenCalledTimes(0);

        p2.readyToPlay = true;

        gameManager.playerReady();

        expect(animateStartSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
