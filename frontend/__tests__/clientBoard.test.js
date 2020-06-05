const ClientBoard = require('frontend/static/js/clientBoard');
const { PIECE_TYPES, ROTATE_LEFT } = require('frontend/helpers/clientConstants');
const { getTestBoard, getTestPieces } = require('common/mockData/mocks');
const { Piece } = require('common/js/piece');
const pubSub = require('frontend/helpers/pubSub');
const { pubSubMocks, TEST_BOARDS } = require('frontend/mockData/mocks');

describe('client - game board tests', () => {
  let gameBoard;
  let p1;
  let pubSubSpy;

  beforeEach(() => {
    gameBoard = new ClientBoard(pubSub);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    pubSubSpy = pubSubMocks();
  })

  afterEach(() => {
    pubSubSpy.unsubscribeAll();
  })

  test('publishes on points from movement', () => {
    gameBoard.piece = p1;
    gameBoard.movePiece(1,0);

    expect(pubSubSpy['draw']).toHaveBeenCalledTimes(1);

    gameBoard.movePiece(0,1);
    
    expect(pubSubSpy['draw']).toHaveBeenCalledTimes(2);
  });

  test('publish board updates on line clear', () => {
    gameBoard.grid = getTestBoard('clearLines2');
    gameBoard.piece = p1;

    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // 1 for adding piece to board
    // 1 for clearing lines
    expect(pubSubSpy['clearLines']).toHaveBeenCalledTimes(1);
    expect(pubSubSpy['boardChange']).toHaveBeenCalledTimes(1);
  });
});