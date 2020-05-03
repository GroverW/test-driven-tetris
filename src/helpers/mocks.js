const TEST_BOARDS = require('./sampleBoards');
const { randomize } = require('./utils');
const { SEED_PIECES } = require('./data');

const mockSend = () => {};

const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

const getTestPieces = () => randomize(SEED_PIECES);

module.exports = {
  mockSend,
  TEST_BOARDS,
  getTestBoard,
  getTestPieces
}