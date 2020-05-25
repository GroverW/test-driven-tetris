const Board = require('../js/board');
const { Piece } = require('../js/piece');
const { PIECES, PIECE_TYPES, SEED_PIECES, ROTATE_LEFT, ROTATE_RIGHT } = require('../helpers/data');
const { TEST_BOARDS, getTestBoard, getTestPieces } = require('../helpers/mocks');
const pubSub = require('../helpers/pubSub');


describe('game board tests', () => {
  let gameBoard;
  let p1, p2, p3, p4, p5;
  let pubSubTest;
  
  beforeEach(() => {
    pubSubTest = pubSub();
    gameBoard = new Board(pubSubTest);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.O);
    p3 = new Piece(PIECE_TYPES.T);
    p4 = new Piece(PIECE_TYPES.L);
    p5 = new Piece(PIECE_TYPES.J);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  
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

  test('wall kick - left side', () => {
    gameBoard.piece = p1;
    expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([3,0]);

    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.movePiece(-4,0);

    expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([-1,0]);

    gameBoard.rotatePiece(ROTATE_RIGHT);

    expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([0,0]);
  });

  test('wall kick - right side', () => {
    gameBoard.piece = p1;
    expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([3,0]);

    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.movePiece(5,0);

    let pieceEdge = gameBoard.piece.x + gameBoard.piece.grid[0].length;
    const boardEdge = gameBoard.grid[0].length;

    expect(pieceEdge).toBeGreaterThan(boardEdge);

    gameBoard.rotatePiece(ROTATE_LEFT);

    pieceEdge = gameBoard.piece.x + gameBoard.piece.grid[0].length;

    expect(pieceEdge).toBe(boardEdge);
  });

  test('gets new piece', () => {
    expect(gameBoard.piece).toBe(undefined);
    expect(gameBoard.nextPiece).toBe(undefined);

    gameBoard.getPieces();

    expect(PIECES[gameBoard.piece.type]).toContainEqual(gameBoard.piece.grid);
    expect(PIECES[gameBoard.nextPiece.type]).toContainEqual(gameBoard.nextPiece.grid);
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
    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern2)

    gameBoard.piece = p4;
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern3);

    gameBoard.piece = p2;
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern4);

    gameBoard.piece = p3;
    gameBoard.rotatePiece(ROTATE_RIGHT);
    gameBoard.movePiece(2,0);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern5);
  });

  test('drop piece if invalid move down', () => {
    gameBoard.piece = p1;
    gameBoard.movePiece(0,18);
    
    expect(gameBoard.grid).toEqual(TEST_BOARDS.empty);
    expect([p1.x, p1.y]).toEqual([3,18]);

    gameBoard.movePiece(0,1);

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
    expect([p1.x, p1.y]).toEqual([3,18]);

    // don't drop piece if invalid horizontal move
    gameBoard.piece = p2;
    gameBoard.movePiece(-4,0);

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
    expect([p2.x, p2.y]).toEqual([0,0]);

    gameBoard.movePiece(-1,0);

    expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
    expect([p2.x, p2.y]).toEqual([0,0]);
  });

  test('clears single line', () => {
    gameBoard.grid = getTestBoard('clearLines1');
    gameBoard.piece = p1;

    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
  });

  test('clears multiple lines', () => {
    gameBoard.grid = getTestBoard('clearLines2');
    gameBoard.piece = p1;
    
    gameBoard.rotatePiece(ROTATE_LEFT);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);
  });

  test('clears non-consecutive lines', () => {
    gameBoard.grid = getTestBoard('clearLines3');
    gameBoard.piece = p5;
    
    gameBoard.rotatePiece(ROTATE_RIGHT);
    gameBoard.movePiece(3,0);
    gameBoard.hardDrop();

    expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines3Cleared);
  });

  test('requests new pieces when almost out', () => {
    gameBoard.pubSub.publish = jest.fn();

    expect(gameBoard.pubSub.publish).not.toHaveBeenCalled();

    // can't go the entire lenght of the list or the index will get reset
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
})

