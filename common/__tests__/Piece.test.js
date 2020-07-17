const Piece = require('common/js/Piece');
const Board = require('common/js/Board');
const {
  PIECES, PIECE_TYPES, ROTATE_LEFT, ROTATE_RIGHT,
} = require('common/helpers/constants');
const { getTestPieces } = require('common/mockData/mocks');

describe('game pieces', () => {
  let p1; let p2; let p3; let p4; let p5; let p6; let p7;
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

  describe('create new piece', () => {
    test('creates a new piece', () => {
      p1 = new Piece(board.pieceList.getNextPiece());
      p2 = new Piece(board.pieceList.getNextPiece());
      p3 = new Piece(board.pieceList.getNextPiece());
      p4 = new Piece(board.pieceList.getNextPiece());

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
  });

  describe('movement', () => {
    test('moves piece', () => {
      expect([p1.x, p1.y]).toEqual([3, 0]);

      p1.move(0, 1);
      expect([p1.x, p1.y]).toEqual([3, 1]);

      p1.move(-1, 0);
      expect([p1.x, p1.y]).toEqual([2, 1]);

      p1.move(1, 0);
      expect([p1.x, p1.y]).toEqual([3, 1]);

      p1.move(0, 1);
      expect([p1.x, p1.y]).toEqual([3, 2]);
    });

    test('updates max y', () => {
      p1.move(0, 2);

      expect(p1.maxY).toBe(2);
      expect(p1.y).toBe(2);

      p1.move(0, -2);

      expect(p1.maxY).toBe(2);
      expect(p1.y).toBe(0);
    });

    test('rotates piece', () => {
      expect(p1.grid).toEqual([
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);

      p1.update(ROTATE_LEFT);

      expect(p1.grid).toEqual([
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ]);

      p1.update(ROTATE_RIGHT);
      p1.update(ROTATE_RIGHT);

      expect(p1.grid).toEqual([
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ]);

      p6.update(ROTATE_LEFT);

      expect(p6.grid).toEqual([
        [6, 6, 0],
        [0, 6, 0],
        [0, 6, 0],
      ]);
    });
  });
});
