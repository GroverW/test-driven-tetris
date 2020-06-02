const COMMON_CONSTANTS = require('common/helpers/constants');

const GAMES = new Map();
const GAME_TYPES = {
  MULTI: 'Multiplayer',
  SINGLE: 'Single Player',
};
const MAX_PLAYERS = {
  [GAME_TYPES.MULTI]: 4,
  [GAME_TYPES.SINGLE]: 1,
};
const CONTROLS = new Set([
  'LEFT',
  'RIGHT',
  'DOWN',
  'AUTO_DOWN',
  'ROTATE_LEFT',
  'ROTATE_RIGHT',
  'HARD_DROP',
  'PLAYER_1',
  'PLAYER_2',
  'PLAYER_3',
  'PLAYER_4',
]);

const RANKINGS = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th"
}

module.exports = {
  ...COMMON_CONSTANTS,
  GAMES,
  GAME_TYPES,
  MAX_PLAYERS,
  CONTROLS,
  RANKINGS,
};