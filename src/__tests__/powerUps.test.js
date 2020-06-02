const { getTestBoard } = require('common/mockData/mocks');
const {
  swapLines
} = require('backend/helpers/powerUps');

describe('power ups', () => {
  beforeEach(() => {

  })
  
  test('swap lines', () => {
    const board1 = getTestBoard('pattern1');
    const board2 = getTestBoard('pattern2');

    const [result1, result2] = swapLines(board1, board2);

    expect(result1).toEqual(getTestBoard('empty'));
    expect(result2).toEqual(getTestBoard('pattern1SwappedWith2'));

    const board3 = getTestBoard('pattern4')
    const board4 = getTestBoard('pattern5')

    const [result3, result4] = swapLines(board3, board4);

    expect(result4).toEqual(getTestBoard('pattern4SwappedWith5'));
  });

  test('swap board', () => {

  });

  test('scramble board', () => {

  });

  test('clear board', () => {

  });
});