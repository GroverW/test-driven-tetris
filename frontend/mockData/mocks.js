const commonMocks = require('common/mocks');
const ClientGame = require('frontend/static/js/ClientGame');

// time in ms for one requestAnimationFrame call
const GAME_TIME_INTERVAL = 100;

/**
 * Gets a mock html canvas ctx
 * @returns {object} - mock ctx
 */
const getMockCtx = () => ({
  canvas: {
    width: 0,
    height: 0,
    xScale: 1,
    yScale: 1,
  },
  scale(xScale, yScale) {
    this.canvas.xScale = xScale;
    this.canvas.yScale = yScale;
  },
  save: jest.fn(),
  restore: jest.fn(),
  clip: jest.fn(),
  fillStyle: '',
  fillRect: jest.fn(),
  lineWidth: 0,
  strokeStyle: '',
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  fill: jest.fn(),
});

/**
 * Gets a mock DOM selector
 * @returns {object} - mock DOM selector
 */
const getMockDOMSelector = () => ({
  id: '',
  innerText: '',
  children: [],
  parentNode: {
    removeChild: jest.fn(),
  },
  get classList() {
    return this.classesObj;
  },
  set classList(list) {
    this.classesObj.classes = list.split(' ');
  },
  classesObj: {
    classes: [],
    add(className) {
      const idx = this.classes.indexOf(className);
      if (idx < 0) this.classes.push(className);
    },
    remove(className) {
      const idx = this.classes.indexOf(className);
      if (idx > -1) this.classes.splice(idx, 1);
    },
    replace(class1, class2) {
      const idx = this.classes.indexOf(class1);
      if (idx > -1) this.classes[idx] = class2;
    },
    contains(className) {
      return this.classes.indexOf(className) > -1;
    },
  },
  getContext: () => getMockCtx(),
  appendChild(selector) { this.children.push(selector); },
  play: jest.fn(),
  pause: jest.fn(),
});

/**
 * Returns list of mock DOM selectors to be used in testing for GameDOM
 */
const getMockGameDOMSelectors = () => ({
  playerCtx: getMockCtx(),
  nextCtx: getMockCtx(),
  opponents: getMockDOMSelector(),
  score: getMockDOMSelector(),
  level: getMockDOMSelector(),
  lines: getMockDOMSelector(),
  player: getMockDOMSelector(),
  message: getMockDOMSelector(),
  music: getMockDOMSelector(),
  powerUps: [getMockDOMSelector(), getMockDOMSelector()],
});

/**
 * Mocks document.requestAnimationFrame
 */
const mockAnimation = () => {
  let t = 0;
  return (callback) => setTimeout(() => {
    t += GAME_TIME_INTERVAL;
    callback(t);
  }, GAME_TIME_INTERVAL);
};

const mockCancelAnimation = (animationId) => {
  clearTimeout(animationId);
};

/**
 *
 * @param {Game|ClientGame|ServerGame|null} game - an existing game to reset
 * @param {string|null} testPiece - I, O, T, S, Z, L, J, N or null
 * @param  {number[]} players - ids of players to add
 */
const getNewTestGame = (testPiece = null, ...players) => {
  const newGame = new ClientGame(1);

  newGame.board.grid = commonMocks.getTestBoard('empty');

  if (testPiece) newGame.board.piece = commonMocks.getTestPiece(testPiece.toUpperCase());

  newGame.addPieces(commonMocks.getTestPieces());
  players.forEach((player) => newGame.addPlayer(player));

  return newGame;
};

const runCommands = (game, ...commands) => {
  commands.forEach((command) => {
    game.command(command, 'down');
    jest.advanceTimersByTime(GAME_TIME_INTERVAL);
    game.command(command, 'up');
  });
};

const clearMocksAndUnsubscribe = (...subscribers) => {
  jest.clearAllMocks();
  subscribers.forEach((subscriber) => subscriber.unsubscribe());
};

module.exports = {
  ...commonMocks,
  getMockCtx,
  getMockDOMSelector,
  getMockGameDOMSelectors,
  mockAnimation,
  mockCancelAnimation,
  getNewTestGame,
  runCommands,
  clearMocksAndUnsubscribe,
};
