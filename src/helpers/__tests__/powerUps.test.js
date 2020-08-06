const { getTestBoard } = require('common/mocks');
const {
  getFilledRow,
  getBlankRow,
  swapLines,
  swapBoards,
  scrambleBoard,
  clearBoard,
  handlePowerUp,
} = require('backend/helpers/powerUps');
const { BOARD_WIDTH, POWER_UP_TYPES } = require('common/constants');

describe('power ups', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('get filled row', () => {
    Math.random = jest.fn().mockReturnValue(0);

    const testLine = getFilledRow();

    expect(testLine).toEqual(getTestBoard('filledLine'));
  });

  test('get blank row', () => {
    const testRow = getBlankRow();
    const expectedRow = new Array(BOARD_WIDTH).fill(0);

    expect(testRow).toEqual(expectedRow);
  });

  test('swap lines', () => {
    const board1 = getTestBoard('pattern1');
    const board2 = getTestBoard('pattern2');

    const [result1, result2] = swapLines(board1, board2);

    expect(result1).toEqual(getTestBoard('empty'));
    expect(result2).toEqual(getTestBoard('pattern1SwappedWith2'));

    const board3 = getTestBoard('pattern5');
    const board4 = getTestBoard('pattern4');

    const [, result4] = swapLines(board3, board4);

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
    Math.random = jest.fn().mockReturnValue(0.5);

    const board = getTestBoard('pattern2');

    const result = scrambleBoard(board);

    expect(result).toEqual(getTestBoard('pattern2Scrambled'));
  });

  test('clear board', () => {
    const board = getTestBoard('pattern5');

    const result = clearBoard(board);

    expect(result).toEqual(getTestBoard('empty'));
  });

  test('handle power up returns the same value as each individual power up', () => {
    Math.random = jest.fn().mockReturnValue(0);

    const runHandlePowerUpTest = (key, powerUp, numBoards) => {
      const boards = new Array(numBoards).fill(null).map(() => getTestBoard('pattern5'));

      if (numBoards === 1) {
        expect([null, powerUp(boards[0])]).toEqual(handlePowerUp(key, null, boards[0]));
      } else {
        expect(powerUp(...boards)).toEqual(handlePowerUp(key, ...boards));
      }
    };

    [
      [POWER_UP_TYPES.SWAP_LINES, swapLines, 2],
      [POWER_UP_TYPES.SWAP_BOARDS, swapBoards, 2],
      [POWER_UP_TYPES.SCRAMBLE_BOARD, scrambleBoard, 1],
      [POWER_UP_TYPES.CLEAR_BOARD, clearBoard, 1],
      ['default', () => [], 0],
    ].forEach(([key, powerUp, numBoards]) => runHandlePowerUpTest(key, powerUp, numBoards));
  });
});
