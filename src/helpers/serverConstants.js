const {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LINES_PER_LEVEL,
  ROTATE_LEFT,
  ROTATE_RIGHT,
  POINTS,
  PIECE_TYPES,
  PIECES,
  SEED_PIECES,
  WALL_KICK_TESTS,
  WALL_KICK_TESTS_I,
} = require('../../common/helpers/constants');

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
  'HARD_DROP'
]);

const RANKINGS = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th"
}

module.exports = {
  GAMES,
  GAME_TYPES,
  MAX_PLAYERS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LINES_PER_LEVEL,
  ROTATE_LEFT,
  ROTATE_RIGHT,
  CONTROLS,
  POINTS,
  RANKINGS,
  PIECE_TYPES,
  PIECES,
  SEED_PIECES,
  WALL_KICK_TESTS,
  WALL_KICK_TESTS_I,
};