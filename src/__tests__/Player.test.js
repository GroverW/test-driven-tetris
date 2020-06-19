const Player = require('backend/js/Player');
const ServerGame = require('backend/js/ServerGame');
const pubSub = require('backend/helpers/pubSub');
const { mockSend } = require('common/mockData/mocks')
const { GAME_TYPES } = require('backend/helpers/serverConstants');


describe('player tests', () => {
  let p1;
  let p2;
  let pubSubTest1;
  let pubSubTest2;

  beforeEach(() => {
    pubSubTest1 = pubSub();
    pubSubTest2 = pubSub();
    p1 = new Player(mockSend, pubSubTest1);
    p2 = new Player(mockSend, pubSubTest2);
  })

  test('setup player', () => {
    expect(p1.game).toEqual(expect.any(ServerGame));
    expect(p2.game).toEqual(expect.any(ServerGame));
  });

  test('set id', () => {
    expect(p1.id).toBe(undefined);
    
    p1.setId(1);

    expect(p1.id).toBe(1);
    expect(p1.game.playerId).toBe(1);
    expect(p1.game.board.playerId).toBe(1);
  })

  test('set game type', () => {
    expect(p1.game.gameType).toBe(undefined);
    p1.setGameType(GAME_TYPES.MULTI);
    expect(p1.game.gameType).toBe(GAME_TYPES.MULTI);
  });
});