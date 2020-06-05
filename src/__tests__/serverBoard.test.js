const ServerBoard = require('backend/js/serverBoard');
const { Piece } = require('common/js/piece');
const { PIECE_TYPES, SEED_PIECES } = require('backend/helpers/serverConstants');
const { getTestBoard, getTestPieces } = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');
const { pubSubMocks } = require('backend/mockData/mocks');

describe('server - board tests', () => {
  let gameBoard;
  let p1;
  let pubSubSpy;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    pubSubSpy = pubSubMocks(pubSubTest);
    gameBoard = new ServerBoard(pubSubTest);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
  });

  test('requests new pieces when almost out', () => {
    expect(pubSubSpy['getPieces']).not.toHaveBeenCalled();

    // can't go the entire length of the list or the index will get reset
    // and almostEmpty() will return false
    for(let i = 0; i < SEED_PIECES.length - 2; i++) gameBoard.getPieces();

    expect(pubSubSpy['getPieces']).toHaveBeenCalled();
    expect(gameBoard.pieceList.almostEmpty()).toBe(true);
  });

  test('publish board updates', () => {
    gameBoard.grid = getTestBoard('clearLines1');
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    expect(pubSubSpy['clearLines']).toHaveBeenCalledTimes(1);
  });
});