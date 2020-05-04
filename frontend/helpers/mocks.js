const TEST_BOARDS = require('./sampleBoards');
const { subscribe } = require('./pubSub');
const { SEED_PIECES } = require('./data');
const { randomize } = require('./utils');

const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

const getTestPieces = () => randomize(SEED_PIECES);

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

const pubSubMocks = () => {
  const mocks = {
    gameOverMock: jest.fn(),
    gameOverMock: jest.fn(),
    lowerPieceMock: jest.fn(),
    drawMock: jest.fn(),
    clearMock: jest.fn(),
    boardMock: jest.fn(),
    updateScoreMock: jest.fn(),
    executeCommandsMock: jest.fn(),
  }
  
  const unsubscribe = [
    subscribe('gameOver', mocks.gameOverMock),
    subscribe('lowerPiece', mocks.lowerPieceMock),
    subscribe('draw', mocks.drawMock),
    subscribe('clearLines', mocks.clearMock),
    subscribe('boardChange', mocks.boardMock),
    subscribe('updateScore', mocks.updateScoreMock),
    subscribe('sendMessage', mocks.executeCommandsMock),
  ]
  
  const clearMockSubscriptions = () => {
    unsubscribe.forEach(unsub => unsub());
  }

  return {
    ...mocks,
    clearMockSubscriptions
  }
}

const webSocketMock = {
    topics: {},
    send(data) {
      const parsed = JSON.parse(data);
      this.topics[parsed.type] && (
        this.topics[parsed.type].forEach(callback => callback(parsed.data))
      );
    },
    on (type, callback) {
      this.topics[type]
        ? this.topics[type].push(callback)
        : this.topics[type] = [callback];
    
      const index = this.topics[type].length - 1;
      const unsubscribe = () => { this.topics[type].splice(index, 1) };
    
      return unsubscribe;
    }
};

module.exports = {
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
  getMockCtx,
  getMockDOMSelector,
  mockAnimation,
  pubSubMocks,
  webSocketMock,
}