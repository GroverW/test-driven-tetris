const { randomize, getEmptyBoard } = require('common/helpers/utils');

/**
 * Creates an object containing new player information
 * @param {object} ctx - player canvas context
 * @param {array} board - player board
 * @param {number} id - player id
 */
const getNewPlayer = (ctx, board, id) => ({ ctx, board, id });

/**
 * Creates an object containing a DOM selector and id of a new player
 * @param {object} selector - DOM selector
 * @param {*} id - player id
 */
const getNewPlayerDOM = (selector, id) => ({ selector, id });

module.exports = {
  randomize,
  getEmptyBoard,
  getNewPlayer,
  getNewPlayerDOM
}