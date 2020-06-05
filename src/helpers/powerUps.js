const { randomize, getEmptyBoard } = require('common/helpers/utils');
const { PIECE_TYPES } = require('common/helpers/constants');

/**
 * Moves the last (up to) 4 lines from one board to another
 * @param {array} board1 - board to remove lines from
 * @param {array} board2 - board to add lines to
 */
const swapLines = (board1, board2) => {
  let newBoard1 = [...board1]
  let newBoard2 = [...board2];
  const blankRow = new Array(board1[0].length).fill(0);

  board1.slice(-2).forEach(row => {
    if(row.some(cell => cell))  {
      // maps each non-empty cell to a neutral grey cell
      const addRow = row.map(cell => cell && PIECE_TYPES.N );
      newBoard2.push(addRow);
      newBoard2.shift();
      newBoard1.unshift([...blankRow]);
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
const scrambleBoard = board => board.map(row => randomize(row));

/**
 * Clears board.
 */
const clearBoard = () => getEmptyBoard();

module.exports = {
  swapLines,
  swapBoards,
  scrambleBoard,
  clearBoard,
};