const GameServer = require('backend/js/gameServer');
const Player = require('backend/js/player');
const pubSub = require('backend/helpers/pubSub');
const { GAMES, GAME_TYPES } = require('backend/helpers/serverConstants');
const { mockSend } = require('common/mockData/mocks')

describe('game server tests', () => {
  let mpGameServer;
  let mpGameServerId;
  let spGameServer;
  let spGameServerId;
  let p1, p2, p3, p4, p5;

  beforeEach(() => {
    p1 = new Player(mockSend, pubSub());
    p2 = new Player(mockSend, pubSub());
    p3 = new Player(mockSend, pubSub());
    p4 = new Player(mockSend, pubSub());
    p5 = new Player(mockSend, pubSub());
    mpGameServerId = GameServer.addGame(1, GAME_TYPES.MULTI);
    mpGameServer = GameServer.getGame(mpGameServerId)
    spGameServerId = GameServer.addGame(2, GAME_TYPES.SINGLE);
    spGameServer = GameServer.getGame(spGameServerId)
  })

  afterEach(() => {
    jest.clearAllMocks();
    GAMES.clear();
    mpGameServer.unsubscribe();
  })

  describe('get, join, leave games', () => {
    test('get game', () => {
      const newGameServer = GameServer.getGame(mpGameServerId);
  
      expect(newGameServer).toEqual(expect.any(GameServer));
    });
  
    describe('single player', () => {
      test('join game - single player', () => {
        const sendAllSpy = jest.spyOn(spGameServer, 'sendAll');

        expect(spGameServer.gameType).toBe(GAME_TYPES.SINGLE);
        expect(spGameServer.join(p1)).toBe(true);
        expect(spGameServer.players.size).toBe(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(1);
      });

      test('join game - game full', () => {
        expect(spGameServer.join(p1)).toBe(true);
        expect(spGameServer.players.size).toBe(1);
        expect(spGameServer.join(p2)).toBe(false);
        expect(spGameServer.players.size).toBe(1);
      });

      test('leave game', () => {
        spGameServer.join(p1);
        expect(spGameServer.players.size).toBe(1);
    
        p1.leave();
        
        expect(spGameServer.players.size).toBe(0);
        
        expect(GAMES.get(spGameServerId)).toBe(undefined);
      });
    });

    describe('multiplayer', () => {
      test('join game - multiplayer', () => {
        const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');
        
        expect(mpGameServer.gameType).toBe(GAME_TYPES.MULTI)
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.players.size).toBe(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(1);
      });
    
      test('join game - game full', () => {
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.join(p2)).toBe(true);
        expect(mpGameServer.join(p3)).toBe(true);
        expect(mpGameServer.join(p4)).toBe(true);
        
        expect(mpGameServer.players.size).toBe(4);
        
        expect(mpGameServer.join(p5)).toBe(false);
    
        expect(mpGameServer.players.size).toBe(4);
      });
    
      test('join game - game started', () => {
        expect(mpGameServer.join(p1)).toBe(true);
        expect(mpGameServer.join(p2)).toBe(true);
        
        mpGameServer.startGame(p1);
    
        expect(mpGameServer.players.size).toBe(2);
        
        expect(mpGameServer.join(p3)).toBe(false);
    
        expect(mpGameServer.players.size).toBe(2);
      });
    
      test('leave game', () => {
        const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');
        
        mpGameServer.join(p1);
        mpGameServer.join(p2);
        expect(mpGameServer.players.size).toBe(2);
    
        p1.leave();
        expect(mpGameServer.players.size).toBe(1);
        expect(sendAllSpy).toHaveBeenCalledTimes(2);
      });
    
      test('leave game - game empty', () => {
        mpGameServer.join(p1);
        expect(mpGameServer.players.size).toBe(1);
    
        p1.leave();
        
        expect(mpGameServer.players.size).toBe(0);
        
        p1.leave();
        expect(GAMES.get(mpGameServerId)).toBe(undefined);
      });
    });
  });

  describe('send messages', () => {
    test('send all', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
  
      const sendSpy1 = jest.spyOn(p1, '_send');
      const sendSpy2 = jest.spyOn(p2, '_send');
  
      mpGameServer.sendAll(p1, '');
  
      expect(sendSpy1).toHaveBeenCalled();
      expect(sendSpy2).toHaveBeenCalled();
    });
  
    test('send all except', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
  
      const sendSpy1 = jest.spyOn(p1, '_send');
      const sendSpy2 = jest.spyOn(p2, '_send');
  
      mpGameServer.sendAllExcept(p1, '');
  
      expect(sendSpy1).not.toHaveBeenCalled();
      expect(sendSpy2).toHaveBeenCalled();
    });
  });

  describe('game host', () => {
    test('game host - makes first player host', () => {
      mpGameServer.join(p1);
  
      expect(p1.isHost).toBe(true);
  
      mpGameServer.join(p2);
  
      expect(p1.isHost).toBe(true);
      expect(p2.isHost).toBe(false);
    });
  
    test('game host - set new host on host leaving', () => {
      mpGameServer.join(p1);
  
      expect(p1.isHost).toBe(true);
  
      mpGameServer.join(p2);
      mpGameServer.join(p3);
      mpGameServer.join(p4);
  
      expect(p1.isHost).toBe(true);
      expect(p2.isHost).toBe(false);
  
      p1.leave()
  
      expect(p2.isHost).toBe(true);
  
      p2.leave();
  
      expect(p3.isHost).toBe(true);
    });
  
    test('game host - only game host can start game', () => {
      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');
  
      mpGameServer.startGame()
  
      expect(mpGameServer.gameStarted).toBe(false);
      expect(sendAllSpy).not.toHaveBeenCalled();
  
      mpGameServer.join(p1);
      mpGameServer.join(p2);
  
      mpGameServer.startGame(p2);
  
      expect(mpGameServer.gameStarted).toBe(false);
      expect(sendAllSpy).toHaveBeenCalledTimes(2);
  
      mpGameServer.startGame(p1);
  
      expect(mpGameServer.gameStarted).toBe(true);
      expect(sendAllSpy).toHaveBeenCalled();
    });
  });

  describe('game start, game over', () => {
    test('game start - update pieces', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);
  
      mpGameServer.startGame(p1);
  
      expect(p1.game.board.pieceList.pieces).toEqual(p1.game.board.pieceList.pieces);
      expect(p2.game.board.pieceList.pieces).toEqual(p3.game.board.pieceList.pieces);
  
      p3.leave();
  
      p1.pubSub.publish('getPieces');
  
      // player who leaves should not get piece updates
      expect(p1.game.board.pieceList.pieces).toEqual(p1.game.board.pieceList.pieces);
      expect(p2.game.board.pieceList.pieces).not.toEqual(p3.game.board.pieceList.pieces);
    });

    test('game over', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);
      
      mpGameServer.startGame(p1);
  
      expect(mpGameServer.nextRanking).toBe(3);
  
      const sendAllSpy = jest.spyOn(mpGameServer, 'sendAll');
      const _sendSpy1 = jest.spyOn(p1, '_send');
  
      // this will add the current piece to the board
      // and try to get a new one on top of it
      p1.game.board.drop();
  
      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      expect(_sendSpy1).toHaveBeenCalledTimes(1);
  
      expect(mpGameServer.nextRanking).toBe(2);
    });

    test('game over - one player remaining', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame(p1);

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

      // last player should automatically get a gameOver because they won
      expect(sendAllSpy).toHaveBeenCalledTimes(3);
      expect(p2.game.gameStatus).toBe(null);
      expect(p3.game.gameStatus).toBe(null);
    });
  
    test('game over - 2nd place leaves', () => {
      mpGameServer.join(p1);
      mpGameServer.join(p2);
      mpGameServer.join(p3);

      mpGameServer.startGame(p1);

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

      mpGameServer.leave(p2);

      expect(mpGameServer.nextRanking).toBe(0);

      // last player should automatically get a gameOver because they won
      expect(sendAllSpy).toHaveBeenCalledTimes(2);
      expect(p1.game.gameStatus).toBe(null);
      expect(p3.game.gameStatus).toBe(null);
    });
  });
});