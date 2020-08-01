const GameManager = require('backend/js/GameManager');
const MessageManager = require('backend/js/MessageManager');
const { GAME_TYPES, COUNTDOWN } = require('backend/helpers/serverConstants');
const { START_GAME, ADD_PIECES } = require('backend/helpers/serverTopics');
const pubSub = require('backend/helpers/pubSub');
const { pubSubMock } = require('common/mockData/mocks');

describe('game manager tests', () => {
  let gameManager;
  let p1; let p2;
  let pubSubSpy;

  const getPlayer = (id) => ({
    id,
    addPieces: jest.fn(),
    game: { start: jest.fn() },
  });

  beforeEach(() => {
    const serverPubSub = pubSub();
    pubSubSpy = pubSubMock(serverPubSub);
    p1 = getPlayer(1);
    p2 = getPlayer(2);
    gameManager = new GameManager(GAME_TYPES.MULTI, serverPubSub);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setup', () => {
    expect(gameManager.msg).toEqual(expect.any(MessageManager));
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

      test('goes through start steps', () => {
        const startSpy = pubSubSpy.add(START_GAME);
        const getPiecesSpy = jest.spyOn(gameManager, 'getPieces');
        const startPlayerGamesSpy = jest.spyOn(gameManager, 'startPlayerGames');
        const sendAllSpy = jest.spyOn(gameManager.msg, 'sendAll');
        const updateRankingsSpy = jest.spyOn(gameManager, 'updateRankings');

        gameManager.startGame();

        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(getPiecesSpy).toHaveBeenCalledTimes(1);
        expect(startPlayerGamesSpy).toHaveBeenCalledTimes(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(2);
        expect(updateRankingsSpy).toHaveBeenCalledTimes(1);
      });

      test('game start animates start', () => {
        jest.useFakeTimers();
        const sendGameMessageSpy = jest.spyOn(gameManager.msg, 'sendGameMessage');
        const startGameSpy = jest.spyOn(gameManager, 'startGame');

        gameManager.animateStart();

        jest.advanceTimersByTime(COUNTDOWN.NUM_INTERVALS * COUNTDOWN.INTERVAL_LENGTH);

        expect(sendGameMessageSpy).toHaveBeenCalledTimes(COUNTDOWN.NUM_INTERVALS);
        expect(startGameSpy).toHaveBeenCalledTimes(1);
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

  describe('game actions', () => {
    beforeEach(() => {
      gameManager.addPlayer(p1);
      gameManager.addPlayer(p2);
    });

    test('getPieces adds a new set of pieces for each player', () => {
      const sendAllSpy = jest.spyOn(gameManager.msg, 'sendAll');

      gameManager.getPieces();

      expect(p1.addPieces).toHaveBeenLastCalledWith(expect.any(Array));
      expect(p2.addPieces).toHaveBeenLastCalledWith(expect.any(Array));
      expect(sendAllSpy).toHaveBeenLastCalledWith({
        type: ADD_PIECES,
        data: expect.any(Array),
      });
    });

    test('startPlayerGames starts each players games', () => {
      gameManager.startPlayerGames();

      expect(p1.game.start).toHaveBeenCalledTimes(1);
      expect(p2.game.start).toHaveBeenCalledTimes(1);
    });

    describe('update rankings', () => {
      test('sets ranking if no rankings', () => {

      });

      test('updates rankings if rankings exist', () => {

      });
    });
  });
});
