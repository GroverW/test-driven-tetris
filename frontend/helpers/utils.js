const { BOARD_WIDTH, BOARD_HEIGHT } = require('../static/js/data');
const randomize = pieces => {
  let start = pieces.length - 1;
  let randomized = [...pieces];

  while (start > 0) {
    const swapWith = Math.floor(Math.random() * (start + 1));
    [randomized[swapWith], randomized[start]] = [randomized[start], randomized[swapWith]];
    start--;
  }

  return randomized;
}

const getEmptyBoard = () => new Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

const getNewPlayer = (ctx, board, id) => ({ ctx, board, id });

const getNewPlayerDOM = (selector, id) => ({ selector, id });

module.exports = {
  randomize,
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM
}