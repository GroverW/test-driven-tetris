const { randomize, getNewPlayer } = require('../helpers/utils');

describe('utils', () => {
  let pieces = [1,2,3,4,5,6,7];

  beforeAll(() => {
    Math.random = jest.fn().mockReturnValue(.5)
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('randomize pieces', () => {
    expect(randomize(pieces)).toEqual([1,6,2,5,3,7,4]);
  });

  test('get new player', () => {
    const testPlayer = {
      ctx: 'test',
      board: [],
      id: 1
    }

    expect(getNewPlayer('test', [], 1)).toEqual(testPlayer)
  });
});