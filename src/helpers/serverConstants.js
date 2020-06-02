const COMMON_CONSTANTS = require('common/helpers/constants');

const GAMES = new Map();

const CONTROLS = new Set([
  'LEFT',
  'RIGHT',
  'DOWN',
  'AUTO_DOWN',
  'ROTATE_LEFT',
  'ROTATE_RIGHT',
  'HARD_DROP',
  ...COMMON_CONSTANTS.PLAYERS,
]);

const POWER_UP_TYPES = {
  SWAP_LINES: 1,
  SWAP_BOARD: 2,
  SCRAMBLE_BOARD: 3,
  CLEAR_BOARD: 4,
};
const POWER_UPS = new Set([
  POWER_UP_TYPES.SWAP_LINES,
  POWER_UP_TYPES.SWAP_BOARD,
  POWER_UP_TYPES.SCRAMBLE_BOARD,
  POWER_UP_TYPES.CLEAR_BOARD,
])

const POWER_UP_LIST = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  1,1,1,1,1,1,1,1,1,2,2,2,3,3,3,4,4,4,
]

const MAX_POWER_UPS = 2;

const RANKINGS = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th"
}

module.exports = {
  ...COMMON_CONSTANTS,
  GAMES,
  CONTROLS,
  POWER_UP_TYPES,
  POWER_UPS,
  POWER_UP_LIST,
  MAX_POWER_UPS,
  RANKINGS,
};