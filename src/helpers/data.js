const GAMES = new Map();
const MAX_PLAYERS = 4;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const LINES_PER_LEVEL = 10;
const ROTATE_LEFT = -1;
const ROTATE_RIGHT = 1;
const CONTROLS = new Set([
  'LEFT',
  'RIGHT',
  'DOWN',
  'AUTO_DOWN',
  'ROTATE_LEFT',
  'ROTATE_RIGHT',
  'HARD_DROP'
]);

const POINTS = {
  DOWN: 1,
  HARD_DROP: 2,
  LINES_CLEARED: {
    1: 100,
    2: 300,
    3: 500,
    4: 800
  }
};

const PIECES = [[
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ], [
    [2,2],
    [2,2]
  ], [
    [0,3,0],
    [3,3,3],
    [0,0,0]
  ], [
    [0,4,4],
    [4,4,0],
    [0,0,0]
  ], [
    [5,5,0],
    [0,5,5],
    [0,0,0]
  ], [
    [6,6,6],
    [6,0,0],
    [0,0,0]
  ], [
    [7,7,7],
    [0,0,7],
    [0,0,0]
  ]
]
const SEED_PIECES = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];


module.exports = {
  GAMES,
  MAX_PLAYERS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LINES_PER_LEVEL,
  ROTATE_LEFT,
  ROTATE_RIGHT,
  CONTROLS,
  POINTS,
  PIECES,
  SEED_PIECES
}