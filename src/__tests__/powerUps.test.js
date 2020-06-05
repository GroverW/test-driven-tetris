const { getTestBoard } = require('common/mockData/mocks');
const {
  swapLines,
  swapBoards,
  scrambleBoard,
  clearBoard,
} = require('backend/helpers/powerUps');

describe('power ups', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('swap lines', () => {
    const board1 = getTestBoard('pattern1');
    const board2 = getTestBoard('pattern2');

    const [result1, result2] = swapLines(board1, board2);

    expect(result1).toEqual(getTestBoard('empty'));
    expect(result2).toEqual(getTestBoard('pattern1SwappedWith2'));

    const board3 = getTestBoard('pattern5')
    const board4 = getTestBoard('pattern4')

    const [result3, result4] = swapLines(board3, board4);

    expect(result4).toEqual(getTestBoard('pattern5SwappedWith4'));
  });

  test('swap board', () => {
    const board1 = getTestBoard('pattern1');
    const board2 = getTestBoard('pattern2');

    const [result1, result2] = swapBoards(board1, board2);

    expect(result1).toEqual(board2);
    expect(result2).toEqual(board1);
  });

  test('scramble board', () => {
    Math.random = jest.fn().mockReturnValue(.5)

    const board = getTestBoard('pattern2');

    const result = scrambleBoard(board);

    expect(result).toEqual(getTestBoard('pattern2Scrambled'));
  });

  test('clear board', () => {
    const board = getTestBoard('pattern5');

    const result = clearBoard(board);

    expect(result).toEqual(getTestBoard('empty'));
  });
});