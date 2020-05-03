const GameServer = require('../js/gameServer');
const Player = require('../js/player');
const { mockSend } = require('../helpers/mocks');

describe('game manager tests', () => {
  let gameServer;
  let gameServerId;
  let p1, p2, p3, p4, p5;

  beforeEach(() => {
    p1 = new Player(mockSend);
    p2 = new Player(mockSend);
    p3 = new Player(mockSend);
    p4 = new Player(mockSend);
    p5 = new Player(mockSend);
    gameServer = new GameServer();
    gameServerId = 1;
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('get game', () => {
    const newGameServer = GameServer.get(gameServerId);

    expect(newGameServer).toEqual(expect.any(GameServer));
  });

  test('join game', () => {
    const broadcastSpy = jest.spyOn(gameServer, 'sendAllExcept');

    expect(gameServer.join(p1)).toBe(true);
    expect(p1.gameServer).toBe(gameServer);
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
    
    gameServer.startGame();

    expect(gameServer.players.size).toBe(2);
    
    expect(gameServer.join(p3)).toBe(false);

    expect(gameServer.players.size).toBe(2);
  });

  test('leave game', () => {
    const sendAllExceptSpy = jest.spyOn(gameServer, 'sendAllExcept');
    
    gameServer.join(p1);
    expect(gameServer.players.size).toBe(1);

    expect(gameServer.leave(p1)).toBe(true);
    expect(gameServer.players.size).toBe(0);
    expect(sendAllExceptSpy).toHaveBeenCalledTimes(2);
  });

  test('leave game - game empty', () => {
    gameServer.join(p1);
    expect(gameServer.players.size).toBe(1);

    expect(gameServer.leave(p1)).toBe(true);
    
    expect(gameServer.players.size).toBe(0);
    
    expect(gameServer.leave(p1)).toBe(false);
  });

  test('send all', () => {
    gameServer.join(p1);
    gameServer.join(p2);

    const sendSpy1 = jest.spyOn(p1, 'send');
    const sendSpy2 = jest.spyOn(p2, 'send');

    gameServer.sendAll(p1, '');

    expect(sendSpy1).toHaveBeenCalled();
    expect(sendSpy2).toHaveBeenCalled();
  });

  test('send all except', () => {
    gameServer.join(p1);
    gameServer.join(p2);

    const sendSpy1 = jest.spyOn(p1, 'send');
    const sendSpy2 = jest.spyOn(p2, 'send');

    gameServer.sendAllExcept(p1, '');

    expect(sendSpy1).not.toHaveBeenCalled();
    expect(sendSpy2).toHaveBeenCalled();
  })

  test('game start', () => {
    const sendAllSpy = jest.spyOn(gameServer, 'sendAll');

    gameServer.startGame();

    expect(sendAllSpy).toHaveBeenCalledTimes(1);
  });

  test('game over', () => {
    gameServer.join(p1);
    gameServer.join(p2);
    gameServer.join(p3);
    
    gameServer.startGame();

    expect(gameServer.nextRanking).toBe(3);

    const sendAllExceptSpy = jest.spyOn(gameServer, 'sendAllExcept');
    const sendToSpy = jest.spyOn(gameServer, 'sendTo');

    p1.gameOver();

    expect(sendAllExceptSpy).toHaveBeenCalledTimes(1);
    expect(sendToSpy).toHaveBeenCalledTimes(1);

    expect(gameServer.nextRanking).toBe(2);
    
    p2.gameOver();

    expect(sendAllExceptSpy).toHaveBeenCalledTimes(2);
    expect(sendToSpy).toHaveBeenCalledTimes(2);

    expect(gameServer.nextRanking).toBe(1);
  });
});