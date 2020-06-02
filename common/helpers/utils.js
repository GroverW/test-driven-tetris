const { BOARD_WIDTH, BOARD_HEIGHT } = require('./constants');
const randomize = arr => {
  let start = arr.length - 1;
  let randomized = [...arr];

  while (start > 0) {
    const swapWith = Math.floor(Math.random() * (start + 1));
    [randomized[swapWith], randomized[start]] = [randomized[start], randomized[swapWith]];
    start--;
  }

  return randomized;
}

const getEmptyBoard = () => new Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

module.exports = {
  randomize,
  getEmptyBoard,
}