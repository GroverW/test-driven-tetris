const { randomize, getEmptyBoard } = require('common/helpers/utils');
const { BOARD_WIDTH, PIECE_TYPES } = require('common/helpers/constants');

const getFilledRow = () => {
  let filledRow = new Array(BOARD_WIDTH).fill(PIECE_TYPES.N);
  
  const clearCell = Math.floor(Math.random() * filledRow.length);

  filledRow[clearCell] = 0;

  return filledRow;
}

const getBlankRow = () => Array(BOARD_WIDTH).fill(0);

/**
 * Moves the last (up to) 4 lines from one board to another
 * @param {array} board1 - board to remove lines from
 * @param {array} board2 - board to add lines to
 */
const swapLines = (board1, board2) => {
  let newBoard1 = [...board1];
  let newBoard2 = [...board2];

  board1.slice(-2).forEach((row) => {
    if(row.some((cell) => cell))  {
      newBoard2.push(getFilledRow());
      newBoard2.shift();
      newBoard1.unshift(getBlankRow());
      newBoard1.pop();
    }
  })

  return [newBoard1, newBoard2];
}

/**
 * Swaps two boards with each other
 * @param {array} board1 
 * @param {array} board2 
 */
const swapBoards = (board1, board2) => {
  const newBoard1 = JSON.parse(JSON.stringify(board2));
  const newBoard2 = JSON.parse(JSON.stringify(board1));
  return [newBoard1, newBoard2];
}

/**
 * Scrambles the cells of every row on a board.
 * @param {array} board - board to scramble
 */
const scrambleBoard = (board) => board.map((row) => randomize(row));

/**
 * Clears board.
 */
const clearBoard = () => getEmptyBoard();

module.exports = {
  getFilledRow,
  getBlankRow,
  swapLines,
  swapBoards,
  scrambleBoard,
  clearBoard,
};