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

const POWER_UP_LIST = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  1,1,1,1,1,1,1,1,1,2,2,2,3,3,3,4,4,4,
];

const RANKINGS = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th"
};

const COUNTDOWN = {
  INTERVAL_LENGTH: 800,
  NUM_INTERVALS: 4,
}

module.exports = {
  ...COMMON_CONSTANTS,
  GAMES,
  CONTROLS,
  POWER_UP_LIST,
  RANKINGS,
  COUNTDOWN,
};