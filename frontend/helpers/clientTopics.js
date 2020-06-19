const COMMON_TOPICS = require('common/helpers/commonTopics');

const DRAW = 'draw';
const BOARD_CHANGE = 'boardChange';
const ADD_ERROR = 'addError';
const CLEAR_ERROR = 'clearError';
const TOGGLE_MENU = 'toggleMenu';
const ADD_POWER_UP = 'addPowerUp';
const USE_POWER_UP = 'usePowerUp';
const UPDATE_SCORE = 'updateScore';
const SEND_MESSAGE = 'sendMessage';

module.exports = {
  ...COMMON_TOPICS,
  DRAW,
  BOARD_CHANGE,
  ADD_ERROR,
  CLEAR_ERROR,
  TOGGLE_MENU,
  ADD_POWER_UP,
  USE_POWER_UP,
  UPDATE_SCORE,
  SEND_MESSAGE,
};