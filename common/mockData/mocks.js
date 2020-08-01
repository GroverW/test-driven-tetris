const { PIECE_TYPES, SEED_PIECES } = require('common/helpers/constants');
const { randomize, getEmptyBoard } = require('common/helpers/utils');
const { subscribe } = require('frontend/helpers/pubSub');
const pubSub = require('backend/helpers/pubSub');
const Piece = require('common/js/Piece');
const TEST_BOARDS = require('./sampleBoards');

/**
 * Used for adding fake websocket .send
 */
const mockSend = () => jest.fn();

/**
 * Creates new test board from sampleBoards
 * @param {string} board - name of test board
 * @returns {number[][]} - test board
 */
const getTestBoard = (board) => {
  if (board === 'empty' || board === 'filledLine') {
    return JSON.parse(JSON.stringify(TEST_BOARDS[board]));
  }

  const baseBoard = getEmptyBoard();
  const updatedParts = TEST_BOARDS[board];
  const combinedBoard = baseBoard.slice(0, baseBoard.length - updatedParts.length);
  combinedBoard.push(...updatedParts);
  return JSON.parse(JSON.stringify(combinedBoard));
};

/**
 * Creates new test piece grid
 * @param {string} type - I, O, T, S, Z, L, J, N
 */
const getTestPiece = (type) => new Piece(PIECE_TYPES[type]);

/**
 * Creates list of piece ids
 * @returns {number[]} - new list of piece ids
 */
const getTestPieces = () => randomize(SEED_PIECES);

/**
 * Simple pubSub object to mock websocket functionality
 */
const webSocketMock = pubSub();

// eslint-disable-next-line func-names
webSocketMock.send = function (data) {
  const parsed = JSON.parse(data);
  if (this.subscribers[parsed.type] !== undefined) {
    this.subscribers[parsed.type].forEach((sub) => sub.callback(parsed.data));
  }
};

webSocketMock.on = webSocketMock.subscribe;

/**
 * Observe when a topic is being published to
 * @param {object} pubSubObj - publish / subscribe object
 */
const pubSubMock = (pubSubObj) => {
  // use frontend pubSub if not specified
  const pubSubSpy = pubSubObj || { subscribe };
  const subscriptions = [];

  /**
   * Adds topic to be tracked
   * @param {string} topic - topic to follow
   */
  const add = (topic) => {
    const newSub = jest.fn();
    subscriptions.push(pubSubSpy.subscribe(topic, newSub));
    return newSub;
  };

  /**
   * Removes all subscriptions
   */
  const unsubscribe = () => subscriptions.forEach((unsub) => unsub());

  return {
    add,
    unsubscribe,
  };
};

module.exports = {
  mockSend,
  getTestBoard,
  getTestPiece,
  getTestPieces,
  webSocketMock,
  pubSubMock,
};
