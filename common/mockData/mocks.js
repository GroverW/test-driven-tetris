const TEST_BOARDS = require('./sampleBoards');
const { SEED_PIECES } = require('../helpers/constants');
const { randomize } = require('../helpers/utils');

const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

const getTestPieces = () => randomize(SEED_PIECES);

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
  webSocketMock,
}