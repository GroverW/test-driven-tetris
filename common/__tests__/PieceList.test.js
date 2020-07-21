const PieceList = require('common/js/PieceList');

describe('piece list tests', () => {
  let pieceList;

  beforeEach(() => {
    pieceList = new PieceList();
  });

  describe('new piece list', () => {
    test('has correct initial properties', () => {
      expect(pieceList.pieces).toEqual([]);
      expect(pieceList.currIdx).toBe(0);
      expect(pieceList.currSet).toBe(0);
    });
  });

  describe('add new pieces', () => {
    test('adds new pieces', () => {
      const newPieces = [1, 2, 3, 4, 5];

      pieceList.addSet(newPieces);

      expect(pieceList.pieces).toEqual([newPieces]);
    });

    test('adds multiple new sets', () => {
      const newPieces = [1, 2, 3, 4, 5];

      pieceList.addSet(newPieces);
      pieceList.addSet(newPieces);

      expect(pieceList.pieces).toEqual([newPieces, newPieces]);
    });
  });

  describe('almost empty', () => {
    test('true when nearing end of current sets', () => {
      const newPieces = new Array(20).fill(0);

      pieceList.addSet(newPieces);

      expect(pieceList.almostEmpty()).toBe(false);

      pieceList.currIdx = 5;

      expect(pieceList.almostEmpty()).toBe(true);
    });

    test('only true if the current set is the last set', () => {
      const newPieces = new Array(20).fill(0);

      pieceList.addSet(newPieces);
      pieceList.addSet(newPieces);

      pieceList.currIdx = 5;

      expect(pieceList.almostEmpty()).toBe(false);

      pieceList.currSet = 1;

      expect(pieceList.almostEmpty()).toBe(true);
    });
  });
});
