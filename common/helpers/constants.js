const GAME_TYPES = {
  MULTI: 'Multiplayer',
  SINGLE: 'Single Player',
};
const MAX_PLAYERS = {
  [GAME_TYPES.MULTI]: 4,
  [GAME_TYPES.SINGLE]: 1,
};

const PLAYERS = new Array(MAX_PLAYERS[GAME_TYPES.MULTI]).fill(null).map((v, i) => `PLAYER${i + 1}`);

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const LINES_PER_LEVEL = 10;
const ROTATE_LEFT = -1;
const ROTATE_RIGHT = 1;
const POINTS = {
  DOWN: 1,
  HARD_DROP: 2,
  LINES_CLEARED: {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
  },
};
const MAX_POWER_UPS = 2;
const POWER_UP_TYPES = {
  SWAP_LINES: 1,
  SWAP_BOARDS: 2,
  SCRAMBLE_BOARD: 3,
  CLEAR_BOARD: 4,
};
const POWER_UPS = new Set([
  POWER_UP_TYPES.SWAP_LINES,
  POWER_UP_TYPES.SWAP_BOARDS,
  POWER_UP_TYPES.SCRAMBLE_BOARD,
  POWER_UP_TYPES.CLEAR_BOARD,
]);
const PIECE_TYPES = {
  I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7, N: 8,
};
const PIECES = {
  [PIECE_TYPES.I]: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ], [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ], [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ], [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [PIECE_TYPES.O]: [
    [
      [2, 2],
      [2, 2],
    ], [
      [2, 2],
      [2, 2],
    ], [
      [2, 2],
      [2, 2],
    ], [
      [2, 2],
      [2, 2],
    ],
  ],
  [PIECE_TYPES.T]: [
    [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ], [
      [0, 3, 0],
      [0, 3, 3],
      [0, 3, 0],
    ], [
      [0, 0, 0],
      [3, 3, 3],
      [0, 3, 0],
    ], [
      [0, 3, 0],
      [3, 3, 0],
      [0, 3, 0],
    ],
  ],
  [PIECE_TYPES.S]: [
    [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0],
    ], [
      [0, 4, 0],
      [0, 4, 4],
      [0, 0, 4],
    ], [
      [0, 0, 0],
      [0, 4, 4],
      [4, 4, 0],
    ], [
      [4, 0, 0],
      [4, 4, 0],
      [0, 4, 0],
    ],
  ],
  [PIECE_TYPES.Z]: [
    [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ], [
      [0, 0, 5],
      [0, 5, 5],
      [0, 5, 0],
    ], [
      [0, 0, 0],
      [5, 5, 0],
      [0, 5, 5],
    ], [
      [0, 5, 0],
      [5, 5, 0],
      [5, 0, 0],
    ],
  ],
  [PIECE_TYPES.L]: [
    [
      [0, 0, 6],
      [6, 6, 6],
      [0, 0, 0],
    ], [
      [0, 6, 0],
      [0, 6, 0],
      [0, 6, 6],
    ], [
      [0, 0, 0],
      [6, 6, 6],
      [6, 0, 0],
    ], [
      [6, 6, 0],
      [0, 6, 0],
      [0, 6, 0],
    ],
  ],
  [PIECE_TYPES.J]: [
    [
      [7, 0, 0],
      [7, 7, 7],
      [0, 0, 0],
    ], [
      [0, 7, 7],
      [0, 7, 0],
      [0, 7, 0],
    ], [
      [0, 0, 0],
      [7, 7, 7],
      [0, 0, 7],
    ], [
      [0, 7, 0],
      [0, 7, 0],
      [7, 7, 0],
    ],
  ],
};
const SEED_PIECES = [
  1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3,
  4, 4, 4, 4, 4, 4, 4,
  5, 5, 5, 5, 5, 5, 5,
  6, 6, 6, 6, 6, 6, 6,
  7, 7, 7, 7, 7, 7, 7,
];
const MAX_WALL_KICKS = 10;
const WALL_KICK_TESTS = {
  [ROTATE_RIGHT]: {
    0: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    1: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    2: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    3: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  },
  [ROTATE_LEFT]: {
    0: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    1: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    2: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    3: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  },
};
const WALL_KICK_TESTS_I = {
  [ROTATE_RIGHT]: {
    0: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    1: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    2: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    3: [[0, 0], [1, 0], [-2, 0], [1, -2], [2, 1]],
  },
  [ROTATE_LEFT]: {
    0: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    1: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    2: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    3: [[0, 0], [2, 0], [-1, 0], [-2, -1], [1, 2]],
  },
};

module.exports = {
  GAME_TYPES,
  MAX_PLAYERS,
  PLAYERS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LINES_PER_LEVEL,
  ROTATE_LEFT,
  ROTATE_RIGHT,
  POINTS,
  MAX_POWER_UPS,
  POWER_UP_TYPES,
  POWER_UPS,
  PIECE_TYPES,
  PIECES,
  SEED_PIECES,
  MAX_WALL_KICKS,
  WALL_KICK_TESTS,
  WALL_KICK_TESTS_I,
};
