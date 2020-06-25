const commonUtils = require('common/helpers/utils');

/**
 * Creates an object containing new player information
 * @param {object} ctx - player canvas context
 * @param {array} board - player board
 * @param {number} id - player id
 */
const getNewPlayer = (ctx, board, id) => ({ ctx, board, id });

/**
 * Creates an object containing a DOM selector and id of a new player
 * @param {object} node - DOM node
 * @param {number} id - player id
 * @param {object} powerUpId - selector for div used to display key to press to use power up
 */
const getNewPlayerDOM = (node, id, powerUpId) => ({ node,  id, powerUpId });

module.exports = {
  ...commonUtils,
  getNewPlayer,
  getNewPlayerDOM,
};