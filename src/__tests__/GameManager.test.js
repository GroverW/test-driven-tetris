const GameManager = require('backend/js/GameManager');
const MessageManager = require('backend/js/MessageManager');
const PlayerManager = require('backend/js/PlayerManager');
const { GAME_TYPES, COUNTDOWN, POWER_UP_TYPES } = require('backend/helpers/serverConstants');
const { ADD_PIECES, END_GAME, MSG_TYPE } = require('backend/helpers/serverTopics');
const { getTestBoard } = require('common/mocks');

describe('game manager tests', () => {
  let gameManager;
  let playerManager;
  let p1; let p2;

  const getTestPlayer = (id) => ({
    id,
    sendMessage: jest.fn(),
    pubSub: { publish: jest.fn() },
    addPieces: jest.fn(),
    game: {
      start: jest.fn(),
      gameStatus: true,
      board: {
        grid: [],
        replaceBoard(board) {
          this.grid = board;
        },
      },
    },
  });

  beforeEach(() => {
    p1 = getTestPlayer(1);
    p2 = getTestPlayer(2);
    playerManager = new PlayerManager();
    gameManager = new GameManager(GAME_TYPES.MULTI, playerManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setup', () => {
    expect(gameManager.msg).toEqual(expect.any(MessageManager));
    expect(gameManager.players).toEqual(expect.any(PlayerManager));
  });

  describe('start game', () => {
    describe('check start conditions', () => {
      beforeEach(() => {
        playerManager.add(p1);
      });

      test('gets total number of players ready', () => {
        expect(gameManager.getTotalReady()).toBe(0);

        p1.readyToPlay = true;

        expect(gameManager.getTotalReady()).toBe(1);
      });

      test('returns true if players ready is == total ready', () => {
        playerManager.add(p2);

        p1.readyToPlay = true;
        p2.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(true);
      });

      test('returns false if players ready is < total ready', () => {
        playerManager.add(p2);

        p1.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(false);
      });

      test('returns false if invalid game type', () => {
        playerManager.add(p2);

        p1.readyToPlay = true;
        p2.readyToPlay = true;
        gameManager.gameType = null;

        expect(gameManager.checkStartConditions()).toBe(false);
      });

      test('sends error if only one player in multiplayer game', () => {
        p1.sendFlash = jest.fn();

        p1.readyToPlay = true;

        expect(gameManager.checkStartConditions()).toBe(false);
        expect(p1.sendFlash).toHaveBeenCalledTimes(1);
        expect(p1.sendFlash).toHaveBeenLastCalledWith(MSG_TYPE.ERROR, expect.any(String));
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
        playerManager.add(p1);
        playerManager.add(p2);
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
      playerManager.add(p1);
      playerManager.add(p2);
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

      test('endGame ends each remaining players game and sends END_GAME message to all', () => {
        const gameOverRemainingPlayersSpy = jest.spyOn(gameManager, 'gameOverRemainingPlayers');
        const sendAllSpy = jest.spyOn(gameManager.msg, 'sendAll');

        gameManager.endGame();

        expect(gameOverRemainingPlayersSpy).toHaveBeenCalledTimes(1);
        expect(sendAllSpy).toHaveBeenLastCalledWith({ type: END_GAME, data: {} });
      });
    });

    describe('check if winner', () => {
      test('returns true if multiplayer game and one player left', () => {
        p1.game.gameStatus = false;

        expect(gameManager.checkIfWinner()).toBe(true);
      });

      test('returns true if single player game and game over', () => {
        playerManager.remove(p2);
        gameManager.gameType = GAME_TYPES.SINGLE;
        p1.game.gameStatus = false;

        expect(gameManager.checkIfWinner()).toBe(true);
      });

      test('returns false if more than one player remaining', () => {
        expect(gameManager.checkIfWinner()).toBe(false);
      });

      test('returns false if single player game with player remaining', () => {
        playerManager.remove(p2);
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
      playerManager.add(p1);
      playerManager.add(p2);
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

    test('executePowerUp modifies specified players', () => {
      Math.random = jest.fn().mockReturnValue(0);
      const sendPlayerUpdateSpy = jest.spyOn(gameManager.msg, 'sendPlayerUpdate');
      p1.game.board.grid = getTestBoard('pattern1');
      p2.game.board.grid = getTestBoard('pattern2');
      const player1 = p1.id;
      const player2 = p2.id;
      let powerUp = POWER_UP_TYPES.SWAP_LINES;

      gameManager.executePowerUp({ player1, player2, powerUp });

      expect(p1.game.board.grid).toEqual(getTestBoard('empty'));
      expect(p2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));
      expect(sendPlayerUpdateSpy).toHaveBeenCalledTimes(2);

      powerUp = POWER_UP_TYPES.CLEAR_BOARD;

      gameManager.executePowerUp({ player1, player2, powerUp });

      expect(p2.game.board.grid).toEqual(getTestBoard('empty'));
      expect(sendPlayerUpdateSpy).toHaveBeenCalledTimes(3);
    });
  });
});
