const COMMON_CONSTANTS = require('common/constants');

const MESSAGE_TIMEOUT = 3000;

const CELL_SIZE = 30;

// map players to keypress ids => [49, 50, 51, 52]
const PLAYER_KEYS = COMMON_CONSTANTS.PLAYERS.map((p, i) => 49 + i);
// map players to object of [PLAYER]: [keypress]
const PLAYER_CONTROLS = COMMON_CONSTANTS.PLAYERS
  .reduce((a, p, i) => ({ ...a, [p]: 49 + i }), {});
// map player_keys to object of [keypress]: [PLAYER]
const PLAYER_CONTROLS_COMMAND_QUEUE = PLAYER_KEYS
  .reduce((a, p, i) => ({ ...a, [p]: `PLAYER${i + 1}` }), {});

const CONTROLS = {
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  AUTO_DOWN: 'AUTO',
  ROTATE_LEFT: 65,
  ROTATE_RIGHT: 83,
  HARD_DROP: 32,
  ...PLAYER_CONTROLS,
};

const COMMAND_QUEUE_MAP = {
  [CONTROLS.LEFT]: 'LEFT',
  [CONTROLS.RIGHT]: 'RIGHT',
  [CONTROLS.DOWN]: 'DOWN',
  [CONTROLS.AUTO_DOWN]: 'AUTO_DOWN',
  [CONTROLS.ROTATE_LEFT]: 'ROTATE_LEFT',
  [CONTROLS.ROTATE_RIGHT]: 'ROTATE_RIGHT',
  [CONTROLS.HARD_DROP]: 'HARD_DROP',
  ...PLAYER_CONTROLS_COMMAND_QUEUE,
};

const POWER_UP_KEY_CODES = new Set([
  ...Object.values(PLAYER_CONTROLS),
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

const COLOR_STEPS = 4;

const adjustColors = (obj, adjAmt) => {
  const adjustedColors = {};
  Object.entries(obj).forEach(([type, rgb]) => {
    let [r, g, b] = rgb;
    r += Math.floor(255, Math.floor(((255 - r) / COLOR_STEPS) * adjAmt));
    g += Math.floor(255, Math.floor(((255 - g) / COLOR_STEPS) * adjAmt));
    b += Math.floor(255, Math.floor(((255 - b) / COLOR_STEPS) * adjAmt));
    adjustedColors[type] = `rgb(${r}, ${g}, ${b})`;
  });

  return adjustedColors;
};

const mapColors = (colors) => (
  new Array(COLOR_STEPS + 1)
    .fill(null)
    .map((_, i) => adjustColors(colors, i))
);

const CELL_COLORS = {
  0: mapColors({
    border: [0, 29, 62],
    highlight: [6, 6, 6],
    lowlight: [6, 6, 6],
    foreground: [6, 6, 6],
  }),
  1: mapColors({
    border: [17, 101, 140],
    highlight: [138, 216, 252],
    lowlight: [39, 148, 199],
    foreground: [99, 188, 230],
  }),
  2: {
    border: [128, 105, 4],
    highlight: [242, 222, 131],
    lowlight: [196, 168, 41],
    foreground: [230, 206, 99],
  },
  3: {
    border: [136, 6, 103],
    highlight: [246, 116, 213],
    lowlight: [207, 50, 168],
    foreground: [230, 78, 192],
  },
  4: {
    border: [5, 128, 16],
    highlight: [106, 242, 118],
    lowlight: [48, 202, 61],
    foreground: [78, 230, 91],
  },
  5: {
    border: [125, 8, 4],
    highlight: [243, 113, 109],
    lowlight: [203, 58, 53],
    foreground: [230, 83, 78],
  },
  6: {
    border: [152, 91, 12],
    highlight: [245, 184, 105],
    lowlight: [222, 143, 41],
    foreground: [246, 168, 67],
  },
  7: {
    border: [5, 29, 134],
    highlight: [110, 135, 246],
    lowlight: [47, 77, 208],
    foreground: [78, 106, 230],
  },
  8: {
    border: [51, 51, 51],
    highlight: [187, 187, 187],
    lowlight: [153, 153, 153],
    foreground: [170, 170, 170],
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
};
