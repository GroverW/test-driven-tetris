const COMMON_CONSTANTS = require('common/helpers/constants');

MESSAGE_TIMEOUT = 3000;

const CELL_SIZE = 30;

// map players to keypress ids
const PLAYER_KEYS = COMMON_CONSTANTS.PLAYERS.map((p, i) => 49 + i);
// map players to object of [PLAYER]: [keypress]
const PLAYER_CONTROLS = COMMON_CONSTANTS.PLAYERS
  .reduce((a, p, i) => a = { ...a, [p]: 49 + i }, {});
// map player_keys to object of [keypress]: [PLAYER]
const PLAYER_CONTROLS_COMMAND_QUEUE = PLAYER_KEYS
  .reduce((a, p, i) => a = { ...a, [p]: `PLAYER${i + 1}` }, {});

const CONTROLS = {
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  AUTO_DOWN: "AUTO",
  ROTATE_LEFT: 65,
  ROTATE_RIGHT: 83,
  HARD_DROP: 32,
  ...PLAYER_CONTROLS,
};

const COMMAND_QUEUE_MAP = {
  [CONTROLS.LEFT]: "LEFT",
  [CONTROLS.RIGHT]: "RIGHT",
  [CONTROLS.DOWN]: "DOWN",
  [CONTROLS.AUTO_DOWN]: "AUTO_DOWN",
  [CONTROLS.ROTATE_LEFT]: "ROTATE_LEFT",
  [CONTROLS.ROTATE_RIGHT]: "ROTATE_RIGHT",
  [CONTROLS.HARD_DROP]: "HARD_DROP",
  ...PLAYER_CONTROLS_COMMAND_QUEUE,
};

const POWER_UP_KEY_CODES = new Set([
  ...Object.values(PLAYER_CONTROLS)
]);

const MOVE_SPEED = [0, 90, 50]; // time in ms
const MAX_SPEED = 21;
const ANIMATION_SPEED = {
  1: 800,
  2: 720,
  3: 630,
  4: 550,
  5: 470,
  6: 380,
  7: 300,
  8: 220,
  9: 130,
  10: 100,
  11: 80,
  12: 80,
  13: 70,
  14: 70,
  15: 70,
  16: 50,
  17: 50,
  18: 50,
  19: 30,
  20: 30,
  21: 20,
};

const CELL_COLORS = {
  0: {
    border: '#000000',
    highlight: '#292929',
    lowlight: '#1a1a1a',
    foreground: '#191919'
  },
  1: {
    border: '#11658C',
    highlight: '#8AD8FC',
    lowlight: '#2794C7',
    foreground: '#63BCE6',
  },
  2: {
    border: '#806904',
    highlight: '#F2DE83',
    lowlight: '#C4A829',
    foreground: '#E6CE63',
  },
  3: {
    border: '#880667',
    highlight: '#F674D5',
    lowlight: '#CF32A8',
    foreground: '#E64EC0',
  },
  4: {
    border: '#058010',
    highlight: '#6AF276',
    lowlight: '#30CA3D',
    foreground: '#4EE65B',
  },
  5: {
    border: '#7D0804',
    highlight: '#F3716D',
    lowlight: '#CB3A35',
    foreground: '#E6534E',
  },
  6: {
    border: '#985b0c',
    highlight: '#f5b869',
    lowlight: '#de8f29',
    foreground: '#f6a843',
  },
  7: {
    border: '#051D86',
    highlight: '#6E87F6',
    lowlight: '#2F4DD0',
    foreground: '#4E6AE6',
  },
  8: {
    border: '#333333',
    highlight: '#bbbbbb',
    lowlight: '#999999',
    foreground: '#aaaaaa',
  },
};

module.exports = {
  ...COMMON_CONSTANTS,
  MESSAGE_TIMEOUT,
  CELL_SIZE,
  PLAYER_KEYS,
  CONTROLS,
  COMMAND_QUEUE_MAP,
  POWER_UP_KEY_CODES,
  MOVE_SPEED,
  ANIMATION_SPEED,
  MAX_SPEED,
  CELL_COLORS,
}