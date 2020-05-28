const Player = require('../js/player');
const ServerGame = require('../js/serverGame');
const { mockSend } = require('../helpers/mocks');
const pubSub = require('../helpers/pubSub');


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