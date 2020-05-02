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

const getNewPlayer = (ctx, board, id) => ({ ctx, board, id });

const getNewPlayerDOM = (selector, id) => ({ selector, id });

module.exports = {
  randomize,
  getNewPlayer,
  getNewPlayerDOM
}