const { randomize, getEmptyBoard } = require('common/helpers/utils');
const { PIECE_TYPES } = require('common/helpers/constants');

/**
 * Moves the last (up to) 4 lines from one board to another
 * @param {array} board1 - board to remove lines from
 * @param {array} board2 - board to add lines to
 */
const swapLines = (board1, board2) => {
  let swapped = [];
  let newBoard1 = [], newBoard2 = [];
  const blankRow = new Array(board1[0].length).fill(0);

  for(let i = board1.length - 4; i < board1.length; i++) {
    if(board1[i].some(cell => cell > 0)) 
      // maps each non-empty cell to a neutral grey cell
      swapped.push(board1[i].map(cell => cell && PIECE_TYPES.N ));
  }

  for(let i = 0; i < swapped.length; i++) newBoard1.push([...blankRow]);
  for(let j = 0; j <  board1.length - swapped.length; j++) newBoard1.push([...board1[j]]);
  
  for(let i = swapped.length; i < board2.length; i++) newBoard2.push([...board2[i]]);
  newBoard2.push(...swapped);

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