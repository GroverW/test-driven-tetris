const commonUtils = require('common/helpers/utils');
const { publish } = require('frontend/helpers/pubSub');
const { ADD_MESSAGE, MSG_TYPE } = require('frontend/topics');

const getNextPieceBoard = () => new Array(4).fill(null).map(() => new Array(4).fill(0));

const filterGrid = (grid, lines) => grid.map((row, idx) => (lines.includes(idx) ? row : []));

/**
 * Creates an object containing new player information
 * @param {object} ctx - player canvas context
 * @param {number[][]} grid - player grid
 * @param {number} id - player id
 */
const getNewPlayer = (ctx, grid, id) => ({ ctx, grid, id });

/**
 * Creates an object containing a DOM selector and id of a new player
 * @param {object} node - DOM node
 * @param {number} id - player id
 * @param {object} powerUpId - selector for div used to display key to press to use power up
 * @param {object} message - selector for div used to display messages
 */
const getNewPlayerDOM = (id, node, powerUpId, message) => ({
  id, node, powerUpId, message,
});

/**
 * Publishes an error
 * @param {string} message - message text to publish
 */
const publishError = (message) => (
  publish(ADD_MESSAGE, { type: MSG_TYPE.ERROR, message })
);

module.exports = {
  ...commonUtils,
  getNextPieceBoard,
  filterGrid,
  getNewPlayer,
  getNewPlayerDOM,
  publishError,
};
