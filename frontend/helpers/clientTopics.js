const COMMON_TOPICS = require('common/helpers/commonTopics');

/**
 * Client publish / subscribe topics
 */
const CLEAR_ERROR = 'clearError';

const TOGGLE_MENU = 'toggleMenu';

const DRAW = 'draw';
const BOARD_CHANGE = 'boardChange';
const UPDATE_SCORE = 'updateScore';

const SEND_MESSAGE = 'sendMessage';

module.exports = {
  ...COMMON_TOPICS,
  CLEAR_ERROR,
  TOGGLE_MENU,
  DRAW,
  BOARD_CHANGE,
  UPDATE_SCORE,
  SEND_MESSAGE,
};