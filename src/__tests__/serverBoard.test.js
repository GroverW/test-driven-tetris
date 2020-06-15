const ServerBoard = require('backend/js/ServerBoard');
const { Piece } = require('common/js/Piece');
const { PIECE_TYPES, SEED_PIECES } = require('backend/helpers/serverConstants');
const { getTestBoard, getTestPieces, pubSubMock } = require('common/mockData/mocks');
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
    p1 = new Piece(PIECE_TYPES.I);
  });

  test('requests new pieces when almost out', () => {
    const getPiecesSpy = pubSubSpy.add('getPieces');
    expect(getPiecesSpy).not.toHaveBeenCalled();

    // can't go the entire length of the list or the index will get reset
    // and almostEmpty() will return false
    for(let i = 0; i < SEED_PIECES.length - 2; i++) gameBoard.getPieces();

    expect(getPiecesSpy).toHaveBeenCalled();
    expect(gameBoard.pieceList.almostEmpty()).toBe(true);
  });

  test('publish board updates', () => {
    const clearLinesSpy = pubSubSpy.add('clearLines');
    gameBoard.grid = getTestBoard('clearLines1');
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    expect(clearLinesSpy).toHaveBeenCalledTimes(1);
  });
});