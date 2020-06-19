const COMMON_TOPICS = require('common/helpers/commonTopics');

/**
 * Client publish / subscribe topics
 */
const DRAW = 'draw';
const BOARD_CHANGE = 'boardChange';
const CLEAR_ERROR = 'clearError';
const TOGGLE_MENU = 'toggleMenu';
const UPDATE_SCORE = 'updateScore';
const SEND_MESSAGE = 'sendMessage';

module.exports = {
  ...COMMON_TOPICS,
  DRAW,
  BOARD_CHANGE,
  CLEAR_ERROR,
  TOGGLE_MENU,
  UPDATE_SCORE,
  SEND_MESSAGE,
};