const GameServer = require('../js/gameServer');
const Player = require('../js/player');

describe('game manager tests', () => {
  let gameServer;
  let gameServerId;
  let p1, p2, p3, p4, p5;

  beforeEach(() => {
    p1 = new Player();
    p2 = new Player();
    p3 = new Player();
    p4 = new Player();
    p5 = new Player();
    gameServer = new GameServer();
    gameServerId = 1;
  })

  test('get game', () => {
    const newGameServer = GameServer.get(gameServerId);

    expect(newGameServer).toEqual(expect.any(GameServer));
  });

  test('join game', () => {
    expect(gameServer.join(p1)).toBe(true);
    expect(gameServer.players.size).toBe(1);

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

  test('leave game', () => {
    gameServer.join(p1);
    expect(gameServer.players.size).toBe(1);

    gameServer.leave(p1);
    expect(gameServer.players.size).toBe(0);
  });

  test('broadcast', () => {

  });
});