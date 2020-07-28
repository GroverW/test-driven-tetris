const { PIECE_TYPES, SEED_PIECES } = require('common/helpers/constants');
const { randomize, getEmptyBoard } = require('common/helpers/utils');
const { subscribe } = require('frontend/helpers/pubSub');
const Piece = require('common/js/Piece');
const TEST_BOARDS = require('./sampleBoards');

/**
 * Used for adding fake websocket .send
 */
const mockSend = () => { };

/**
 * Creates new test board from sampleBoards
 * @param {string} board - name of test board
 * @returns {number[][]} - test board
 */
const getTestBoard = (board) => {
  if(board === 'empty' || board === 'filledLine') {
    return JSON.parse(JSON.stringify(TEST_BOARDS[board]));
  }

  const baseBoard = getEmptyBoard();
  const updatedParts = TEST_BOARDS[board];
  const combinedBoard = baseBoard.slice(0,baseBoard.length - updatedParts.length);
  combinedBoard.push(...updatedParts)
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
const webSocketMock = {
  topics: {},
  send(data) {
    const parsed = JSON.parse(data);
    if (this.topics[parsed.type] !== undefined) {
      this.topics[parsed.type].forEach((sub) => sub.callback(parsed.data));
    }
  },
  on(type, callback) {
    const id = this.topics[type]
      ? this.addSub(type, callback)
      : this.addTopic(type, callback);

    const unsubscribe = () => {
      this.removeSub(type, id);
    };

    return unsubscribe;
  },
  addTopic(type, callback) {
    const id = 0;
    this.topics[type] = [{ id, callback }];
    return id;
  },
  addSub(type, callback) {
    const id = this.topics[type].reduce((max, obj) => Math.max(max, obj.id), 0) + 1;
    this.topics[type].push({ id, callback });

    return id;
  },
  removeSub(type, id) {
    this.topics[type] = this.topics[type].filter((s) => s.id !== id);
  },
};

/**
 * Observe when a topic is being published to
 * @param {object} pubSub - publish / subscribe object
 */
const pubSubMock = (pubSub) => {
  // use frontend pubSub if not specified
  const pubSubSpy = pubSub || { subscribe };
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
  const unsubscribeAll = () => subscriptions.forEach((unsub) => unsub());

  return {
    add,
    unsubscribeAll,
  };
};

module.exports = {
  TEST_BOARDS,
  mockSend,
  getTestBoard,
  getTestPiece,
  getTestPieces,
  webSocketMock,
  pubSubMock,
};
