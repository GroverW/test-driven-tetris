const GameManager = require('backend/js/GameManager');
const MessageManager = require('backend/js/MessageManager');
const { GAME_TYPES, COUNTDOWN } = require('backend/helpers/serverConstants');
const { ADD_PIECES } = require('backend/helpers/serverTopics');

describe('game manager tests', () => {
  let gameManager;
  let p1; let p2;

  const getPlayer = (id) => ({
    id,
    pubSub: { publish: jest.fn() },
    addPieces: jest.fn(),
    game: {
      start: jest.fn(),
      gameStatus: true,
      board: {},
    },
  });

  beforeEach(() => {
    p1 = getPlayer(1);
    p2 = getPlayer(2);
    gameManager = new GameManager(GAME_TYPES.MULTI);
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
        const getPiecesSpy = jest.spyOn(gameManager, 'getPieces');
        const startPlayerGamesSpy = jest.spyOn(gameManager, 'startPlayerGames');
        const sendAllSpy = jest.spyOn(gameManager.msg, 'sendAll');
        expect(gameManager.gameStarted).toBe(false);

        gameManager.startGame();

        expect(gameManager.gameStarted).toBe(true);
        expect(getPiecesSpy).toHaveBeenCalledTimes(1);
        expect(startPlayerGamesSpy).toHaveBeenCalledTimes(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(2);
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

  describe('game over', () => {
    beforeEach(() => {
      gameManager.addPlayer(p1);
      gameManager.addPlayer(p2);
      gameManager.gameStarted = true;
    });

    describe('gameOver steps', () => {
      test('gameOver sends game over message to specified player and checks for winner', () => {
        const sendGameOverMessageSpy = jest.spyOn(gameManager.msg, 'sendGameOverMessage');
        const checkIfWinnerSpy = jest.spyOn(gameManager, 'checkIfWinner');

        gameManager.gameOver({ id: p1.id, board: [] });

        expect(sendGameOverMessageSpy).toHaveBeenLastCalledWith(p1.id, [], 2);
        expect(checkIfWinnerSpy).toHaveBeenCalledTimes(1);
      });

      test('gameOver ends game if checkIfWinner returns true', () => {
        gameManager.endGame = jest.fn();

        gameManager.gameOver({ id: '', board: [] });

        expect(gameManager.endGame).toHaveBeenCalledTimes(0);

        gameManager.checkIfWinner = jest.fn().mockReturnValue(true);

        gameManager.gameOver({ id: '', board: [] });

        expect(gameManager.endGame).toHaveBeenCalledTimes(1);
      });
    });

    describe('check if winner', () => {
      test('returns true if multiplayer game and one player left', () => {
        p1.game.gameStatus = false;

        expect(gameManager.checkIfWinner()).toBe(true);
      });

      test('returns true if single player game and game over', () => {
        gameManager.removePlayer(p2);
        gameManager.gameType = GAME_TYPES.SINGLE;
        p1.game.gameStatus = false;

        expect(gameManager.checkIfWinner()).toBe(true);
      });

      test('returns false if more than one player remaining', () => {
        expect(gameManager.checkIfWinner()).toBe(false);
      });

      test('returns false if single player game with player remaining', () => {
        gameManager.removePlayer(p2);
        gameManager.gameType = GAME_TYPES.SINGLE;

        expect(gameManager.checkIfWinner()).toBe(false);
      });

      test('returns false if game has not started yet', () => {
        gameManager.gameStarted = false;

        expect(gameManager.checkIfWinner()).toBe(false);
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

    test('getNextRanking gets next ranking', () => {
      expect(gameManager.getNextRanking()).toBe(2);
      p1.game.gameStatus = false;
      expect(gameManager.getNextRanking()).toBe(1);
    });
  });
});
