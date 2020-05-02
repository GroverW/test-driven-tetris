const TEST_BOARDS = require('./sampleBoards');

const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

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
  fillStyle: "",
  fillRect: jest.fn(),
  lineWidth: 0,
  strokeStyle: "",
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
});

const getMockDOMSelector = () => ({
  id: "",
  innerText: "",
  parentNode: {
    removeChild: jest.fn()
  },
  classList: {
    classes: [],
    add(className) {
      this.classes.push(className)
    },
    replace(class1, class2) {
      const idx = this.classes.indexOf(class1);
      if (idx >= 0) this.classes[idx] = class2;
      if (idx < 0) this.classes.push(class2);
    },
    contains(className) {
      return this.classes.indexOf(className) >= 0;
    }
  },
  getContext: () => getMockCtx(),
  appendChild: jest.fn(),
});

const mockAnimation = () => {
  let t = 0;
  return (callback) => setTimeout(() => {
    t += 100;
    callback(t);
  }, 100)
};

module.exports = {
  TEST_BOARDS,
  getTestBoard,
  getMockCtx,
  getMockDOMSelector,
  mockAnimation,
}