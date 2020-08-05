const ServerBoard = require('backend/js/ServerBoard');
const { SEED_PIECES } = require('backend/helpers/serverConstants');
const { GET_PIECES, CLEAR_LINES } = require('backend/helpers/serverTopics');
const { getTestBoard, getTestPiece, getTestPieces, pubSubMock } = require('common/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('server - board tests', () => {
  let gameBoard;
  let p1;
  let pubSubSpy;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    pubSubSpy = pubSubMock(pubSubTest);
    gameBoard = new ServerBoard(pubSubTest);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = getTestPiece('I');
  });

  test('requests new pieces when almost out', () => {
    const getPiecesSpy = pubSubSpy.add(GET_PIECES);
    expect(getPiecesSpy).not.toHaveBeenCalled();

    // can't go the entire length of the list or the index will get reset
    // and almostEmpty() will return false
    for (let i = 0; i < SEED_PIECES.length - 2; i += 1) gameBoard.getPieces();

    expect(getPiecesSpy).toHaveBeenCalled();
    expect(gameBoard.pieceList.almostEmpty()).toBe(true);
  });

  test('publish board updates', () => {
    const clearLinesSpy = pubSubSpy.add(CLEAR_LINES);
    gameBoard.grid = getTestBoard('clearLines1');
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    expect(clearLinesSpy).toHaveBeenCalledTimes(1);
  });
});
