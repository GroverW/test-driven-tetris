const { 
  randomize,
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM,
  publishError,
} = require('frontend/helpers/clientUtils');
const { getTestBoard, pubSubMock } = require('frontend/mockData/mocks');
const { ADD_MESSAGE } = require('frontend/helpers/clientTopics');

describe('utils', () => {
  let pieces = [1,2,3,4,5,6,7];
  let pubSubSpy;

  beforeAll(() => {
    pubSubSpy = pubSubMock();
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

  test('get new player DOM', () => {
    const testPlayerDOM = {
      node: 'test',
      id: 1,
      powerUpId: 1,
    }

    expect(getNewPlayerDOM('test', 1, 1)).toEqual(testPlayerDOM);
  });

  test('get empty board', () => {
    const testBoard = getTestBoard('empty');

    expect(getEmptyBoard()).toEqual(testBoard);
  });

  test('publish error', () => {
    const errorSpy = pubSubSpy.add(ADD_MESSAGE);

    expect(errorSpy).toHaveBeenCalledTimes(0);

    publishError('test');

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});