const GameServer = require('../js/gameServer');
const Player = require('../js/player');
const { mockSend } = require('../helpers/mocks');
const pubSub = require('../helpers/pubSub');
const { GAMES } = require('../helpers/data');

describe('game server tests', () => {
  let gameServer;
  let gameServerId;
  let p1, p2, p3, p4, p5;

  beforeEach(() => {
    p1 = new Player(mockSend, pubSub());
    p2 = new Player(mockSend, pubSub());
    p3 = new Player(mockSend, pubSub());
    p4 = new Player(mockSend, pubSub());
    p5 = new Player(mockSend, pubSub());
    gameServerId = 1;
    gameServer = GameServer.get(gameServerId)
  })

  afterEach(() => {
    jest.clearAllMocks();
    GAMES.clear();
  })

  test('get game', () => {
    const newGameServer = GameServer.get(gameServerId);

    expect(newGameServer).toEqual(expect.any(GameServer));
  });

  test('join game', () => {
    const broadcastSpy = jest.spyOn(gameServer, 'sendAllExcept');

    expect(gameServer.join(p1)).toBe(true);
    expect(gameServer.players.size).toBe(1);
    expect(broadcastSpy).toHaveBeenCalledTimes(1);
  });

  test('join game - game full', () => {
    expect(gameServer.join(p1)).toBe(true);
    expect(gameServer.join(p2)).toBe(true);
    expect(gameServer.join(p3)).toBe(true);
    expect(gameServer.join(p4)).toBe(true);
    
    expect(gameServer.players.size).toBe(4);
    
    expect(gameServer.join(p5)).toBe(false);

    expect(gameServer.players.size).toBe(4);
  });

  test('join game - game started', () => {
    expect(gameServer.join(p1)).toBe(true);
    expect(gameServer.join(p2)).toBe(true);
    
    gameServer.startGame(p1);

    expect(gameServer.players.size).toBe(2);
    
    expect(gameServer.join(p3)).toBe(false);

    expect(gameServer.players.size).toBe(2);
  });

  test('leave game', () => {
    const sendAllExceptSpy = jest.spyOn(gameServer, 'sendAllExcept');
    
    gameServer.join(p1);
    gameServer.join(p2);
    expect(gameServer.players.size).toBe(2);

    p1.leave();
    expect(gameServer.players.size).toBe(1);
    expect(sendAllExceptSpy).toHaveBeenCalledTimes(3);
  });

  test('leave game - game empty', () => {
    gameServer.join(p1);
    expect(gameServer.players.size).toBe(1);

    p1.leave();
    
    expect(gameServer.players.size).toBe(0);
    
    p1.leave();
    expect(GAMES.get(gameServerId)).toBe(undefined);
  });

  test('send all', () => {
    gameServer.join(p1);
    gameServer.join(p2);

    const sendSpy1 = jest.spyOn(p1, '_send');
    const sendSpy2 = jest.spyOn(p2, '_send');

    gameServer.sendAll(p1, '');

    expect(sendSpy1).toHaveBeenCalled();
    expect(sendSpy2).toHaveBeenCalled();
  });

  test('send all except', () => {
    gameServer.join(p1);
    gameServer.join(p2);

    const sendSpy1 = jest.spyOn(p1, '_send');
    const sendSpy2 = jest.spyOn(p2, '_send');

    gameServer.sendAllExcept(p1, '');

    expect(sendSpy1).not.toHaveBeenCalled();
    expect(sendSpy2).toHaveBeenCalled();
  })

  test('game host - makes first player host', () => {
    gameServer.join(p1);

    expect(p1.isHost).toBe(true);

    gameServer.join(p2);

    expect(p1.isHost).toBe(true);
    expect(p2.isHost).toBe(false);
  });

  test('game host - set new host on host leaving', () => {
    gameServer.join(p1);

    expect(p1.isHost).toBe(true);

    gameServer.join(p2);
    gameServer.join(p3);
    gameServer.join(p4);

    expect(p1.isHost).toBe(true);
    expect(p2.isHost).toBe(false);

    p1.leave()

    expect(p2.isHost).toBe(true);

    p2.leave();

    expect(p3.isHost).toBe(true);
  });

  test('game host - only game host can start game', () => {
    const sendAllSpy = jest.spyOn(gameServer, 'sendAll');

    gameServer.startGame()

    expect(gameServer.gameStarted).toBe(false);
    expect(sendAllSpy).not.toHaveBeenCalled();

    gameServer.join(p1);
    gameServer.join(p2);

    gameServer.startGame(p2);

    expect(gameServer.gameStarted).toBe(false);
    expect(sendAllSpy).not.toHaveBeenCalled();

    gameServer.startGame(p1);

    expect(gameServer.gameStarted).toBe(true);
    expect(sendAllSpy).toHaveBeenCalled();
  });

  test('game over', () => {
    gameServer.join(p1);
    gameServer.join(p2);
    gameServer.join(p3);
    
    gameServer.startGame(p1);

    expect(gameServer.nextRanking).toBe(3);

    const sendAllExceptSpy = jest.spyOn(gameServer, 'sendAll');
    const _sendSpy1 = jest.spyOn(p1, '_send');
    const _sendSpy2 = jest.spyOn(p2, '_send');

    // this will add the current piece to the board
    // and try to get a new one on top of it
    p1.game.board.drop();

    expect(sendAllExceptSpy).toHaveBeenCalledTimes(1);
    expect(_sendSpy1).toHaveBeenCalledTimes(1);

    expect(gameServer.nextRanking).toBe(2);
    
    p2.game.board.drop();

    expect(sendAllExceptSpy).toHaveBeenCalledTimes(2);
    expect(_sendSpy1).toHaveBeenCalledTimes(2);
    expect(_sendSpy2).toHaveBeenCalledTimes(2);

    expect(gameServer.nextRanking).toBe(1);
  });

  test('game start - update pieces', () => {
    gameServer.join(p1);
    gameServer.join(p2);
    gameServer.join(p3);

    gameServer.startGame(p1);

    expect(p1.game.board.pieceList.pieces).toEqual(p1.game.board.pieceList.pieces);
    expect(p2.game.board.pieceList.pieces).toEqual(p3.game.board.pieceList.pieces);

    p3.leave();

    p1.pubSub.publish('getPieces');

    // player who leaves should not get piece updates
    expect(p1.game.board.pieceList.pieces).toEqual(p1.game.board.pieceList.pieces);
    expect(p2.game.board.pieceList.pieces).not.toEqual(p3.game.board.pieceList.pieces);
  });
});