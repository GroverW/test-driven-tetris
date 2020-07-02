const commonMocks = require('common/mockData/mocks')

/**
 * Gets a mock html canvas ctx
 * @returns {object} - mock ctx
 */
const getMockCtx = () => ({
  canvas: {
    width: 0,
    height: 0,
    xScale: 1,
    yScale: 1
  },
  scale(xScale, yScale) {
    this.canvas.xScale = xScale;
    this.canvas.yScale = yScale;
  },
  save: jest.fn(),
  restore: jest.fn(),
  clip: jest.fn(),
  fillStyle: "",
  fillRect: jest.fn(),
  lineWidth: 0,
  strokeStyle: "",
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
  id: "",
  innerText: "",
  parentNode: {
    removeChild: jest.fn()
  },
  get classList() {
    return this._classList;
  },
  set classList(list) {
    this._classList.classes = list.split(' ');
  },
  _classList: {
    classes: [],
    add(className) {
      const idx = this.classes.indexOf(className);
      if (idx < 0) this.classes.push(className)
    },
    remove(className) {
      const idx = this.classes.indexOf(className);
      if (idx > -1) this.classes.splice(idx, 1);
    },
    replace(class1, class2) {
      const idx = this.classes.indexOf(class1);
      if (idx > -1) this.classes[idx] = class2;
    },
    toggle(className) {
      const idx = this.classes.indexOf(className);
      idx > -1 ? this.remove(className) : this.add(className);
    },
    contains(className) {
      return this.classes.indexOf(className) > -1;
    }
  },
  getContext: () => getMockCtx(),
  appendChild: jest.fn(),
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
    t += 100;
    callback(t);
  }, 100)
};

module.exports = {
  ...commonMocks,
  getMockCtx,
  getMockDOMSelector,
  getMockGameDOMSelectors,
  mockAnimation,
};