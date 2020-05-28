const { Piece } = require('../js/piece');
const Board = require('../js/board');
const { PIECES, PIECE_TYPES, ROTATE_LEFT, ROTATE_RIGHT } = require('../helpers/constants');
const { getTestPieces } = require('../mockData/mocks');

describe('game pieces', () => {
  let p1, p2, p3, p4, p5, p6, p7;
  let board;

  beforeEach(() => {
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.O);
    p3 = new Piece(PIECE_TYPES.T);
    p4 = new Piece(PIECE_TYPES.S);
    p5 = new Piece(PIECE_TYPES.Z);
    p6 = new Piece(PIECE_TYPES.L);
    p7 = new Piece(PIECE_TYPES.J);
    board = new Board();
    board.pieceList.addSet(getTestPieces());
  });

  test('creates a new piece', () => {
    const p1 = new Piece(board.pieceList.getNextPiece());
    const p2 = new Piece(board.pieceList.getNextPiece());
    const p3 = new Piece(board.pieceList.getNextPiece());
    const p4 = new Piece(board.pieceList.getNextPiece());
    
    expect(PIECES[p1.type]).toContainEqual(p1.grid);
    expect(PIECES[p2.type]).toContainEqual(p2.grid);
    expect(PIECES[p3.type]).toContainEqual(p3.grid);
    expect(PIECES[p4.type]).toContainEqual(p4.grid);
  });

  test('starts in the right location', () => {
    expect(p1.x).toBe(3);
    expect(p2.x).toBe(4);
    expect(p3.x).toBe(3);
    expect(p4.x).toBe(3);
    expect(p5.x).toBe(3);
    expect(p6.x).toBe(3);
    expect(p7.x).toBe(3);
  });

  test('can move piece', () => {
    expect([p1.x, p1.y]).toEqual([3,0]);

    p1.move(0,1);
    expect([p1.x, p1.y]).toEqual([3,1]);

    p1.move(-1,0);
    expect([p1.x, p1.y]).toEqual([2,1]);

    p1.move(1,0);
    expect([p1.x, p1.y]).toEqual([3,1]);
    
    p1.move(0,1);
    expect([p1.x, p1.y]).toEqual([3,2]);
  });

  test('can rotate piece', () => {
    expect(p1.grid).toEqual([
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ]);
    
    p1.update(ROTATE_LEFT);

    expect(p1.grid).toEqual([
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
    ]);

    p1.update(ROTATE_RIGHT);
    p1.update(ROTATE_RIGHT);

    expect(p1.grid).toEqual([
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0],
    ]);

    p6.update(ROTATE_LEFT);

    expect(p6.grid).toEqual([
      [6,6,0],
      [0,6,0],
      [0,6,0],
    ])
  });


})