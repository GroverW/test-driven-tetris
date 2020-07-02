const commonUtils = require('common/helpers/utils');
const { publish } = require('frontend/helpers/pubSub');
const { ADD_MESSAGE, MSG_TYPE } = require('frontend/helpers/clientTopics');

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
 * @param {object} message - selector for div used to display messages
 */
const getNewPlayerDOM = (id, node, powerUpId, message) => ({ id, node, powerUpId, message });

/**
 * Publishes an error
 * @param {string} message - message text to publish
 */
const publishError = (message) => (
  publish(ADD_MESSAGE, { type: MSG_TYPE.ERROR, message })
);

module.exports = {
  ...commonUtils,
  getNewPlayer,
  getNewPlayerDOM,
  publishError,
};