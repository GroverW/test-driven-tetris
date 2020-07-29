const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const pubSub = require('backend/helpers/pubSub');
const {
  GAMES, GAME_TYPES, POWER_UP_TYPES, COUNTDOWN,
} = require('backend/helpers/serverConstants');
const { GET_PIECES, PLAY } = require('backend/helpers/serverTopics');
const { mockSend, getTestBoard } = require('common/mockData/mocks');

describe('game server tests', () => {
  let mpGameServer;
  let mpGameServerId;
  let spGameServer;
  let spGameServerId;
  let p1; let p2; let p3; let p4; let p5;

  beforeEach(() => {
    p1 = new Player(mockSend, pubSub());
    p2 = new Player(mockSend, pubSub());
    p3 = new Player(mockSend, pubSub());
    p4 = new Player(mockSend, pubSub());
    p5 = new Player(mockSend, pubSub());
    mpGameServerId = GameServer.addGame(1, GAME_TYPES.MULTI);
    mpGameServer = GameServer.getGame(mpGameServerId);
    spGameServerId = GameServer.addGame(2, GAME_TYPES.SINGLE);
    spGameServer = GameServer.getGame(spGameServerId);
  });

  afterEach(() => {
    jest.clearAllMocks();
    GAMES.clear();
    mpGameServer.unsubscribe();
  });

  describe('get, join, leave games', () => {
    test('get game', () => {
      const newGameServer = GameServer.getGame(mpGameServerId);

      expect(newGameServer).toEqual(expect.any(GameServer));
    });

    describe('single player', () => {
      test('join game - single player', () => {
        expect(spGameServer.gameType).toBe(GAME_TYPES.SINGLE);
        expect(spGameServer.join(p1)).toBe(true);
        expect(spGameServer.players.length).toBe(1);
      });

      test('join game - only one player can join', () => {
        expect(spGameServer.join(p1)).toBe(true);
        expect(spGameServer.players.length).toBe(1);
        expect(spGameServer.join(p2)).toBe(false);
        expect(spGameServer.players.length).toBe(1);
      });

      test('leave game', () => {
        spGameServer.join(p1);
        expect(spGameServer.players.length).toBe(1);

        p1.leave();

        expect(spGameServer.players.length).toBe(0);

        expect(GAMES.get(spGameServerId)).toBe(undefined);
      });
    });

    describe('multiplayer', () => {
      test('join game - multiplayer', () => {
        const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

        expect(mpGameServer.gameType).toBe(GAME_TYPES.MULTI);
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.players.length).toBe(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(1);
      });

      test('join game - game full', () => {
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.join(p2)).toBe(true);
        expect(mpGameServer.join(p3)).toBe(true);
        expect(mpGameServer.join(p4)).toBe(true);

        expect(mpGameServer.players.length).toBe(4);

        expect(mpGameServer.join(p5)).toBe(false);

        expect(mpGameServer.players.length).toBe(4);
      });

      test('join game - game started', () => {
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.join(p2)).toBe(true);

        mpGameServer.startGame();

        expect(mpGameServer.players.length).toBe(2);

        expect(mpGameServer.join(p3)).toBe(false);

        expect(mpGameServer.players.length).toBe(2);
      });

      test('leave game', () => {
        const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

        mpGameServer.join(p1);
        mpGameServer.join(p2);
        expect(mpGameServer.players.length).toBe(2);

        expect(sendAllSpy).toHaveBeenCalledTimes(2);

        p1.leave();
        expect(mpGameServer.players.length).toBe(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(3);
      });

      test('leave game - game empty', () => {
        mpGameServer.join(p1);
        expect(mpGameServer.players.length).toBe(1);

        p1.leave();

        expect(mpGameServer.players.length).toBe(0);

        p1.leave();
        expect(GAMES.get(mpGameServerId)).toBe(undefined);
      });
    });
  });

  describe('send messages', () => {
    test('send all', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);

      const sendSpy1 = jest.spyOn(p1, 'send');
      const sendSpy2 = jest.spyOn(p2, 'send');

      mpGameServer.sendAll(p1, '');

      expect(sendSpy1).toHaveBeenCalled();
      expect(sendSpy2).toHaveBeenCalled();
    });

    test('send all except', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);

      const sendSpy1 = jest.spyOn(p1, 'send');
      const sendSpy2 = jest.spyOn(p2, 'send');

      mpGameServer.sendAllExcept(p1, '');

      expect(sendSpy1).not.toHaveBeenCalled();
      expect(sendSpy2).toHaveBeenCalled();
    });
  });

  describe('game host', () => {
    test('game host - makes first player host', () => {
      expect(p1.isHost).toBe(false);

      mpGameServer.join(p1);

      expect(p1.isHost).toBe(true);

      mpGameServer.join(p2);

      expect(p1.isHost).toBe(true);
      expect(p2.isHost).toBe(false);
    });

    test('game host - set new host on host leaving', () => {
      const sendSpy = jest.spyOn(p2, 'send');
      mpGameServer.join(p1);

      expect(p1.isHost).toBe(true);

      mpGameServer.join(p2);
      mpGameServer.join(p3);
      mpGameServer.join(p4);

      expect(p1.isHost).toBe(true);
      expect(p2.isHost).toBe(false);
      expect(sendSpy).toHaveBeenCalledTimes(4);

      p1.leave();

      expect(p2.isHost).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(6);

      p2.leave();

      expect(p3.isHost).toBe(true);
    });
  });

  describe('game start, game over', () => {
    test('game start - single player - game starts when player ready', () => {
      const animateStartSpy = jest.spyOn(spGameServer, 'animateStart');

      spGameServer.join(p1);

      expect(animateStartSpy).toHaveBeenCalledTimes(0);

      p1.pubSub.publish(PLAY, p1);

      expect(animateStartSpy).toHaveBeenCalledTimes(1);
    });

    test('game start - multiplayer - game starts all players ready', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      const animateStartSpy = jest.spyOn(mpGameServer, 'animateStart');
      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

      p1.pubSub.publish(PLAY, p1);
      p2.pubSub.publish(PLAY, p2);

      expect(sendAllSpy).toHaveBeenCalledTimes(2);
      expect(animateStartSpy).toHaveBeenCalledTimes(0);

      p3.pubSub.publish(PLAY, p3);

      expect(sendAllSpy).toHaveBeenCalledTimes(2);
      expect(animateStartSpy).toHaveBeenCalledTimes(1);
    });

    test('game start - multiplayer - game only starts if > 1 player', () => {
      mpGameServer.join(p1);

      const animateStartSpy = jest.spyOn(mpGameServer, 'animateStart');
      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

      p1.pubSub.publish(PLAY, p1);

      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      expect(animateStartSpy).toHaveBeenCalledTimes(0);

      mpGameServer.join(p2);
      mpGameServer.join(p3);

      p2.pubSub.publish(PLAY, p2);
      p3.pubSub.publish(PLAY, p3);

      expect(sendAllSpy).toHaveBeenCalledTimes(4);
      expect(animateStartSpy).toHaveBeenCalledTimes(1);
    });

    test('game start - update pieces', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame();

      expect(p1.game.board.pieceList.pieces).toEqual(p2.game.board.pieceList.pieces);
      expect(p2.game.board.pieceList.pieces).toEqual(p3.game.board.pieceList.pieces);

      p3.leave();

      p1.pubSub.publish(GET_PIECES);

      expect(p1.game.board.pieceList.pieces).toEqual(p2.game.board.pieceList.pieces);
      expect(p2.game.board.pieceList.pieces).not.toEqual(p3.game.board.pieceList.pieces);
    });

    test('game start - animate start', () => {
      jest.useFakeTimers();

      mpGameServer.join(p1);
      mpGameServer.join(p2);

      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

      expect(mpGameServer.gameStarted).toBe(false);
      expect(sendAllSpy).toHaveBeenCalledTimes(0);

      mpGameServer.animateStart();

      expect(mpGameServer.gameStarted).toBe(false);
      expect(sendAllSpy).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(COUNTDOWN.INTERVAL_LENGTH);

      expect(mpGameServer.gameStarted).toBe(false);
      expect(sendAllSpy).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(COUNTDOWN.INTERVAL_LENGTH * COUNTDOWN.NUM_INTERVALS);

      expect(mpGameServer.gameStarted).toBe(true);
      expect(sendAllSpy).toHaveBeenCalledTimes(6);
    });

    test('game over sent when player loses', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame();

      expect(mpGameServer.nextRanking).toBe(3);

      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');
      const sendSpy1 = jest.spyOn(p1, 'send');

      // this will add the current piece to the board
      // and try to get a new one on top of it
      p1.game.board.drop();

      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy1).toHaveBeenCalledTimes(1);

      expect(mpGameServer.nextRanking).toBe(2);
    });

    test('game over and end game sent when one player remaining', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame();

      expect(mpGameServer.nextRanking).toBe(3);

      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

      expect(p1.game.gameStatus).toBe(true);
      expect(p2.game.gameStatus).toBe(true);
      expect(p3.game.gameStatus).toBe(true);

      p1.game.board.drop();

      expect(mpGameServer.nextRanking).toBe(2);

      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      expect(p1.game.gameStatus).toBe(null);
      expect(p2.game.gameStatus).toBe(true);
      expect(p3.game.gameStatus).toBe(true);

      p2.game.board.drop();

      expect(mpGameServer.nextRanking).toBe(0);

      // p2 and p3 should be sent gameOver, and all should be sent endGame
      expect(sendAllSpy).toHaveBeenCalledTimes(4);
      expect(p2.game.gameStatus).toBe(null);
      expect(p3.game.gameStatus).toBe(null);
    });

    test('game over and end game sent when 2nd place leaves', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame();

      expect(mpGameServer.nextRanking).toBe(3);

      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');

      expect(p1.game.gameStatus).toBe(true);
      expect(p2.game.gameStatus).toBe(true);
      expect(p3.game.gameStatus).toBe(true);

      p1.game.board.drop();

      expect(mpGameServer.nextRanking).toBe(2);

      // 1 for game over
      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      expect(p1.game.gameStatus).toBe(null);
      expect(p2.game.gameStatus).toBe(true);
      expect(p3.game.gameStatus).toBe(true);

      mpGameServer.leave(p2);

      expect(mpGameServer.nextRanking).toBe(0);

      // last player should automatically get a gameOver because they won
      // all players should be notified of player leaving
      expect(sendAllSpy).toHaveBeenCalledTimes(4);
      expect(p1.game.gameStatus).toBe(null);
      expect(p3.game.gameStatus).toBe(null);
    });
  });

  describe('power ups', () => {
    test('execute power up on publish', () => {
      Math.random = jest.fn().mockReturnValue(0);

      mpGameServer.join(p1);
      mpGameServer.join(p2);

      p1.game.board.grid = getTestBoard('pattern1');
      p2.game.board.grid = getTestBoard('pattern2');

      p1.game.addPowerUp(POWER_UP_TYPES.SWAP_LINES);

      mpGameServer.startGame();

      p1.game.usePowerUp(p2.id);

      expect(p1.game.board.grid).toEqual(getTestBoard('empty'));
      expect(p2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));

      p1.game.addPowerUp(POWER_UP_TYPES.CLEAR_BOARD);
      p1.game.usePowerUp(p2.id);

      expect(p2.game.board.grid).toEqual(getTestBoard('empty'));
    });
  });

  describe('error messages', () => {
    test('join game - game full', () => {
      const sendSpy = jest.spyOn(p5, 'send');

      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);
      mpGameServer.join(p4);

      mpGameServer.join(p5);

      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    test('join game - game started', () => {
      const sendSpy = jest.spyOn(p3, 'send');

      mpGameServer.join(p1);
      mpGameServer.join(p2);

      mpGameServer.startGame();

      mpGameServer.join(p3);

      // would be 2 if joined successfully
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    test('game start - multiplayer - not enough players', () => {
      mpGameServer.join(p1);
      const sendSpy = jest.spyOn(p1, 'send');
      const animateStartSpy = jest.spyOn(mpGameServer, 'animateStart');
      expect(sendSpy).toHaveBeenCalledTimes(0);

      p1.pubSub.publish(PLAY, p1);

      expect(animateStartSpy).toHaveBeenCalledTimes(0);
      expect(sendSpy).toHaveBeenCalledTimes(2);
    });
  });
});
