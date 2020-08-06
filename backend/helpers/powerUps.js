const { randomize, getEmptyBoard } = require('common/helpers/utils');
const {
  BOARD_WIDTH, PIECE_TYPES, POWER_UP_LIST, POWER_UP_TYPES,
} = require('backend/constants');

/**
 * Returns a board row with all neutral cells except one blank cell
 * @returns {number[][]}
 */
const getFilledRow = () => {
  const filledRow = new Array(BOARD_WIDTH).fill(PIECE_TYPES.N);

  const clearCell = Math.floor(Math.random() * filledRow.length);

  filledRow[clearCell] = 0;

  return filledRow;
};

/**
 * Returns a blank board row
 * @returns {number[]}
 */
const getBlankRow = () => Array(BOARD_WIDTH).fill(0);

/**
 * Moves the last (up to) 4 lines from one board to another
 * @param {number[][]} board1 - board to remove lines from
 * @param {number[][]} board2 - board to add lines to
 * @returns {number[][][]} - new boards
 */
const swapLines = (board1, board2) => {
  const newBoard1 = [...board1];
  const newBoard2 = [...board2];

  board1.slice(-2).forEach((row) => {
    if (row.some((cell) => cell)) {
      newBoard2.shift();
      newBoard2.push(getFilledRow());
      newBoard1.unshift(getBlankRow());
      newBoard1.pop();
    }
  });

  return [newBoard1, newBoard2];
};

/**
 * Swaps two boards with each other
 * @param {number[][]} board1
 * @param {number[][]} board2
 * @returns {number[][][]} - new boards
 */
const swapBoards = (board1, board2) => {
  const newBoard1 = JSON.parse(JSON.stringify(board2));
  const newBoard2 = JSON.parse(JSON.stringify(board1));
  return [newBoard1, newBoard2];
};

/**
 * Scrambles the cells of every row on a board.
 * @param {number[][]} board - board to scramble
 * @returns {number[][]} - scrambled board
 */
const scrambleBoard = (board) => board.map((row) => randomize(row));

/**
 * Clears board.
 * @returns {number[][]} - empty board
 */
const clearBoard = () => getEmptyBoard();

/**
 * Adds random power up from power up list
 * @returns {number} - power up id
 */
const getRandomPowerUp = () => {
  const idx = Math.floor(Math.random() * POWER_UP_LIST.length);
  return POWER_UP_LIST[idx];
};

const handlePowerUp = (type, board1, board2) => {
  switch (type) {
    case POWER_UP_TYPES.SWAP_LINES:
      return swapLines(board1, board2);
    case POWER_UP_TYPES.SWAP_BOARDS:
      return swapBoards(board1, board2);
    case POWER_UP_TYPES.SCRAMBLE_BOARD:
      return [null, scrambleBoard(board2)];
    case POWER_UP_TYPES.CLEAR_BOARD:
      return [null, clearBoard()];
    default:
      return [];
  }
};

module.exports = {
  getFilledRow,
  getBlankRow,
  swapLines,
  swapBoards,
  scrambleBoard,
  clearBoard,
  getRandomPowerUp,
  handlePowerUp,
};
