const { randomize, getEmptyBoard } = require('../../common/helpers/utils');

const getNewPlayer = (ctx, board, id) => ({ ctx, board, id });

const getNewPlayerDOM = (selector, id) => ({ selector, id });

module.exports = {
  randomize,
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM
}