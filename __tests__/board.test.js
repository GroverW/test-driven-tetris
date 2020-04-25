const Board = require('../board');
const { BOARD_WIDTH, BOARD_HEIGHT } = require('../config');


describe('game board tests', () => {
  let testBoard;
  
  beforeEach(() => {
    testBoard = new Array(BOARD_WIDTH).map(() => Array(BOARD_HEIGHT).fill(0));
  })

  test('creates a new, empty board', () => {
    const gameBoard = new Board();
    expect(gameBoard.grid).toEqual(testBoard);
  })
})

