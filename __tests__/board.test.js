const Board = require('../board');
const { Piece } = require('../piece');
const { PIECES, ROTATE_LEFT, ROTATE_RIGHT } = require('../data');
const { TEST_BOARDS } = require('./helpers/testData');


describe('game board tests', () => {
  let gameBoard;
  let p1, p2, p3, p4;
  
  beforeEach(() => {
    gameBoard = new Board();
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[1]);
    p3 = new Piece(PIECES[2]);
    p4 = new Piece(PIECES[5]);
  });
  
  test('creates a new, empty board', () => {
    expect(gameBoard.grid).toEqual(TEST_BOARDS.empty);
  });

  test('moves piece only to valid position', () => {
    gameBoard.piece = p2;
    expect([p2.x, p2.y]).toEqual([4,0]);
    
    gameBoard.movePiece(-1,0)
    expect([p2.x, p2.y]).toEqual([3,0]);
    
    p2.move(-3, 0)
    expect([p2.x, p2.y]).toEqual([0,0]);
    
    gameBoard.movePiece(-1,0)
    expect([p2.x, p2.y]).toEqual([0,0]);
  });

  test('gets new piece', () => {
    expect(gameBoard.piece).toBe(undefined);
    expect(gameBoard.nextPiece).toBe(undefined);

    gameBoard.getPieces();

    expect(PIECES).toContainEqual(gameBoard.piece.grid);
    expect(PIECES).toContainEqual(gameBoard.nextPiece.grid);
  });

  test('hard drop piece', () => {
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
  });

  test('gets new piece on drop', () => {
    gameBoard.getPieces();
    
    const currPiece = gameBoard.piece;
    const nextPiece = gameBoard.nextPiece;
    
    gameBoard.hardDrop();

    expect(gameBoard.piece).not.toBe(currPiece);
    expect(gameBoard.piece).toBe(nextPiece);
    expect(gameBoard.nextPiece).toEqual(expect.any(Piece));
  });

  test('hard drop piece with obstacles', () => {
    gameBoard.piece = p1;
    gameBoard.movePiece(-1,0);
    gameBoard.rotatePiece(gameBoard.piece, ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern2)

    gameBoard.piece = p4;
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern3);

    gameBoard.piece = p2;
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern4);

    gameBoard.piece = p3;
    gameBoard.rotatePiece(gameBoard.piece, ROTATE_RIGHT);
    gameBoard.movePiece(2,0);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern5);
  });
})

