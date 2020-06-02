const COMMON_CONSTANTS = require('common/helpers/constants');

const CELL_SIZE = 30;

// map players to keypress ids
const PLAYER_KEYS = COMMON_CONSTANTS.PLAYERS.map((p,i) => 49 + i);
// map players to object of [PLAYER]: [keypress]
const PLAYER_CONTROLS = COMMON_CONSTANTS.PLAYERS
  .reduce((a, p, i) => a = { ...a, [p]: 49 + i }, {});
// map player_keys to object of [keypress]: [PLAYER]
const PLAYER_CONTROLS_COMMAND_QUEUE = PLAYER_KEYS
  .reduce((a, p, i) => a = { ...a, [p]: `PLAYER${i + 1}` });

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

const POWER_UPS = new Set([
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
  0: "#111111",
  1: "#63BCE6",
  2: "#E6CE63",
  3: "#E64EC0",
  4: "#4EE65B",
  5: "#E6534E",
  6: "#E6A44E",
  7: "#4E6AE6",
};

module.exports = {
  ...COMMON_CONSTANTS,
  CELL_SIZE,
  PLAYER_KEYS,
  CONTROLS,
  COMMAND_QUEUE_MAP,
  POWER_UPS,
  MOVE_SPEED,
  ANIMATION_SPEED,
  MAX_SPEED,
  CELL_COLORS,
}