
/**
 * Common publish / subscribe topics
 */
const ADD_MESSAGE = 'addMessage';
const CLEAR_MESSAGE = 'clearMessage';
const MSG_TYPE = {
  ERROR: 'error',
  NOTICE: 'notice',
};

const PLAY = 'play';
const START_GAME = 'startGame';
const GAME_OVER = 'gameOver';

const GAME_MESSAGE = 'gameMessage';

const ADD_PIECES = 'addPieces';
const LOWER_PIECE = 'lowerPiece';
const CLEAR_LINES = 'clearLines';

const ADD_PLAYER = 'addPlayer';
const REMOVE_PLAYER = 'removePlayer';
const UPDATE_PLAYER = 'updatePlayer';

const EXECUTE_COMMANDS = 'executeCommands';

const ADD_POWER_UP = 'addPowerUp';
const USE_POWER_UP = 'usePowerUp';

module.exports = {
  ADD_MESSAGE,
  CLEAR_MESSAGE,
  MSG_TYPE,
  PLAY,
  GAME_MESSAGE,
  START_GAME,
  GAME_OVER,
  ADD_PIECES,
  LOWER_PIECE,
  CLEAR_LINES,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_PLAYER,
  EXECUTE_COMMANDS,
  ADD_POWER_UP,
  USE_POWER_UP,
};