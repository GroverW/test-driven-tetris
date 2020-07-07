const COMMON_TOPICS = require('common/helpers/commonTopics');

/**
 * Client publish / subscribe topics
 */
const TOGGLE_MENU = 'toggleMenu';

const DRAW = 'draw';
const BOARD_CHANGE = 'boardChange';
const UPDATE_SCORE = 'updateScore';

const SEND_MESSAGE = 'sendMessage';

const SET_COMMAND = 'setCommand';
const SET_AUTO_COMMAND = 'setAutoCommand';
const CLEAR_COMMAND = 'clearCommand';

const ADD_LOCK_DELAY = 'addLockDelay';
const INTERRUPT_DELAY = 'interruptDelay';

module.exports = {
  ...COMMON_TOPICS,
  TOGGLE_MENU,
  DRAW,
  BOARD_CHANGE,
  UPDATE_SCORE,
  SEND_MESSAGE,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
  ADD_LOCK_DELAY,
  INTERRUPT_DELAY,
};