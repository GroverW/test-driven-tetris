const TEST_BOARDS = require('./sampleBoards');
const { SEED_PIECES } = require('common/helpers/constants');
const { randomize } = require('common/helpers/utils');
const { subscribe } = require('frontend/helpers/pubSub');

/**
 * Used for adding fake websocket .send
 */
const mockSend = () => { };

/**
 * Creates new test board from sampleBoards
 * @param {string} board - name of test board
 * @returns {array} - test board
 */
const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

/**
 * Creates list of piece ids
 * @returns {array} - new array of piece ids
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
      this.topics[parsed.type].forEach(callback => callback(parsed.data))
    };
  },
  on(type, callback) {
    this.topics[type]
      ? this.topics[type].push(callback)
      : this.topics[type] = [callback];

    const index = this.topics[type].length - 1;
    const unsubscribe = () => this.topics[type].splice(index, 1);

    return unsubscribe;
  }
};

/**
 * Observe when a topic is being published to
 * @param {object} pubSub - publish / subscribe object
 */
const pubSubMock = pubSub => {
  // use frontend pubSub if not specified
  if (!pubSub) pubSub = { subscribe };
  let subscriptions = [];

  /**
   * Adds topic to be tracked
   * @param {string} topic - topic to follow
   */
  const add = topic => {
    const newSub = jest.fn();
    subscriptions.push(pubSub.subscribe(topic, newSub))
    return newSub;
  }

  /**
   * Removes all subscriptions
   */
  const unsubscribeAll = () => subscriptions.forEach(unsub => unsub());

  return {
    add,
    unsubscribeAll,
  }
}

module.exports = {
  TEST_BOARDS,
  mockSend,
  getTestBoard,
  getTestPieces,
  webSocketMock,
  pubSubMock,
}