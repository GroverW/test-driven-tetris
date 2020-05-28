const Player = require('backend/js/player');
const ServerGame = require('backend/js/serverGame');
const pubSub = require('backend/helpers/pubSub');
const { mockSend } = require('common/mockData/mocks')


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
});