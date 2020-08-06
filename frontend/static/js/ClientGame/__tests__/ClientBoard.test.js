const ClientBoard = require('frontend/static/js/ClientGame/ClientBoard');
const { ROTATE_LEFT } = require('frontend/constants');
const { DRAW, CLEAR_LINES, BOARD_CHANGE } = require('frontend/topics');
const {
  getTestBoard, getTestPiece, getTestPieces, pubSubMock,
} = require('common/mocks');
const pubSub = require('frontend/helpers/pubSub');

describe('client - game board tests', () => {
  let gameBoard;
  let p1;
  let pubSubSpy;

  beforeEach(() => {
    gameBoard = new ClientBoard(pubSub);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = getTestPiece('I');
    gameBoard.piece = p1;
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    pubSubSpy.unsubscribe();
  });

  test('publishes on points from movement', () => {
    const drawSpy = pubSubSpy.add(DRAW);

    gameBoard.movePiece(1, 0);

    expect(drawSpy).toHaveBeenCalledTimes(1);

    gameBoard.movePiece(0, 1);

    expect(drawSpy).toHaveBeenCalledTimes(2);
  });

  test('publish board updates on line clear', () => {
    const clearLinesSpy = pubSubSpy.add(CLEAR_LINES);
    const boardChangeSpy = pubSubSpy.add(BOARD_CHANGE);

    gameBoard.grid = getTestBoard('clearLines2');

    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(getTestBoard('clearLines2Cleared3'));

    // 1 for adding piece to board
    // 1 for clearing lines
    expect(clearLinesSpy).toHaveBeenCalledTimes(1);
    expect(boardChangeSpy).toHaveBeenCalledTimes(1);
  });

  test('publish boards updates when board gets replaced', () => {
    const newBoard = getTestBoard('pattern3');

    const drawSpy = pubSubSpy.add(DRAW);

    gameBoard.replaceBoard(newBoard);

    expect(drawSpy).toHaveBeenCalledTimes(1);
  });

  test('validates whether piece has reached lowest point', () => {
    gameBoard.movePiece(0, 1, 0);

    expect(gameBoard.isPieceAtLowestPoint()).toBe(true);

    gameBoard.movePiece(0, -1, 0);

    expect(gameBoard.isPieceAtLowestPoint()).toBe(false);
  });
});
