const ClientBoard = require('../static/js/clientBoard');
const { PIECE_TYPES, ROTATE_LEFT } = require('../helpers/clientConstants');
const { getTestBoard, getTestPieces } = require('../../common/__tests__/helpers/mocks');
const { Piece } = require('../../common/js/piece');
const { publish } = require('../helpers/pubSub');
const { pubSubMocks, TEST_BOARDS } = require('../helpers/mocks');

describe('client - game board tests', () => {
  let gameBoard;
  let p1;
  let publishTest;
  let pubSub;

  beforeEach(() => {
    publishTest = publish;
    gameBoard = new ClientBoard(publishTest);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    pubSub = pubSubMocks();
  })

  test('publishes on points from movement', () => {
    gameBoard.piece = p1;
    gameBoard.movePiece(1,0);

    expect(pubSub.drawMock).toHaveBeenCalledTimes(1);

    gameBoard.movePiece(0,1);
    
    expect(pubSub.drawMock).toHaveBeenCalledTimes(2);
  });

  test('publish board updates on line clear', () => {
    gameBoard.grid = getTestBoard('clearLines2');
    gameBoard.piece = p1;

    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // 1 for adding piece to board
    // 1 for clearing lines
    expect(pubSub.clearMock).toHaveBeenCalledTimes(1);
    expect(pubSub.boardMock).toHaveBeenCalledTimes(1);
  });
});