const {
  randomize,
  randomizedBuckets,
  getNextPieceBoard,
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
  publishError,
} = require('frontend/helpers/utils');
const { getTestBoard, pubSubMock } = require('frontend/mocks');
const { ADD_MESSAGE } = require('frontend/topics');

describe('utils', () => {
  const pieces = [1, 2, 3, 4, 5, 6, 7];
  let pubSubSpy;

  beforeEach(() => {
    pubSubSpy = pubSubMock();
    Math.random = jest.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNextPieceBoard', () => {
    test('gets empty board', () => {
      expect(getNextPieceBoard()).toEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });
  });

  describe('randomize', () => {
    const expected = [1, 6, 2, 5, 3, 7, 4];

    test('randomizes pieces', () => {
      expect(randomize(pieces)).toEqual(expected);
    });

    test('repeatedly randomized list', () => {
      expect(randomizedBuckets(pieces, 2)).toEqual([...expected, ...expected]);
    });
  });

  describe('getNewPlayer', () => {
    test('gets new player object', () => {
      const testPlayer = {
        ctx: 'test',
        grid: [],
        id: 1,
      };

      expect(getNewPlayer('test', [], 1)).toEqual(testPlayer);
    });
  });

  describe('getNewPlayerDOM', () => {
    test('gets new player DOM object', () => {
      const testPlayerDOM = {
        id: 1,
        node: 'test',
        powerUpId: 1,
        message: 1,
      };

      expect(getNewPlayerDOM(1, 'test', 1, 1)).toEqual(testPlayerDOM);
    });
  });

  describe('getEmptyBoard', () => {
    test('gets empty board', () => {
      const testBoard = getTestBoard('empty');

      expect(getEmptyBoard()).toEqual(testBoard);
    });
  });

  describe('publishError', () => {
    test('publishes error', () => {
      const errorSpy = pubSubSpy.add(ADD_MESSAGE);

      expect(errorSpy).toHaveBeenCalledTimes(0);

      publishError('test');

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
