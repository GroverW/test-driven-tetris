const { pieceList, Piece } = require('../piece');
const Board = require('../board');
const { PIECES, ROTATE_LEFT, ROTATE_RIGHT } = require('../data');

describe('game pieces', () => {
  let p1, p2, p3, p4, p5, p6, p7;
  let board;

  beforeEach(() => {
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[1]);
    p3 = new Piece(PIECES[2]);
    p4 = new Piece(PIECES[3]);
    p5 = new Piece(PIECES[4]);
    p6 = new Piece(PIECES[5]);
    p7 = new Piece(PIECES[6]);
    board = new Board();
  });

  test('creates a new piece', () => {
    const p1 = new Piece(pieceList.getNextPiece());
    const p2 = new Piece(pieceList.getNextPiece());
    const p3 = new Piece(pieceList.getNextPiece());
    const p4 = new Piece(pieceList.getNextPiece());
    
    expect(PIECES).toContainEqual(p1.grid);
    expect(PIECES).toContainEqual(p2.grid);
    expect(PIECES).toContainEqual(p3.grid);
    expect(PIECES).toContainEqual(p4.grid);
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
    
    board.rotatePiece(p1, ROTATE_LEFT);

    expect(p1.grid).toEqual([
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
    ]);

    board.rotatePiece(p1, ROTATE_RIGHT);
    board.rotatePiece(p1, ROTATE_RIGHT);

    expect(p1.grid).toEqual([
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0],
      [0,0,1,0],
    ]);

    board.rotatePiece(p6, ROTATE_LEFT);

    expect(p6.grid).toEqual([
      [6,0,0],
      [6,0,0],
      [6,6,0],
    ])
  });


})