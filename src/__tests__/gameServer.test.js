const GameServer = require('../js/gameServer');
const Player = require('../js/player');

describe('game manager tests', () => {
  let gameServer;
  let gameServerId;

  beforeEach(() => {
    gameServer = new GameServer();
    gameServerId = 1;
  })

  test('get game', () => {
    const newGameServer = GameServer.get(gameServerId);

    expect(newGameServer).toEqual(expect.any(GameServer));
  });

  test('join game', () => {
    const player = new Player();

    gameServer.join(player);

    expect(gameServer.players.length).toBe(1);

  });

  test('leave game', () => {

  });

  test('broadcast', () => {

  });
});