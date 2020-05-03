const TEST_BOARDS = require('./sampleBoards');

const mockSend = () => {};

const getTestBoard = (board) =>
  JSON.parse(JSON.stringify(TEST_BOARDS[board]));

module.exports = {
  mockSend,
  TEST_BOARDS,
  getTestBoard
}