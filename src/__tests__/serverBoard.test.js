const ServerBoard = require('backend/js/serverBoard');
const { Piece } = require('common/js/piece');
const { PIECE_TYPES, SEED_PIECES } = require('backend/helpers/serverConstants');
const { getTestBoard, getTestPieces } = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('server - board tests', () => {
  let gameBoard;
  let p1;

  beforeEach(() => {
    gameBoard = new ServerBoard(pubSub());
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
  })

  test('requests new pieces when almost out', () => {
    gameBoard.pubSub.publish = jest.fn();

    expect(gameBoard.pubSub.publish).not.toHaveBeenCalled();

    // can't go the entire length of the list or the index will get reset
    // and almostEmpty() will return false
    for(let i = 0; i < SEED_PIECES.length - 2; i++) gameBoard.getPieces();

    expect(gameBoard.pubSub.publish).toHaveBeenCalled();
    expect(gameBoard.pieceList.almostEmpty()).toBe(true);
  })

  test('publish board updates', () => {
    const publishSpy = jest.spyOn(gameBoard, 'publishBoardUpdate');

    gameBoard.grid = getTestBoard('clearLines1');
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    // 1 for adding piece to board, 1 for clearing lines
    expect(publishSpy).toHaveBeenCalledTimes(2);
  });
});