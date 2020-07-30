const PieceList = require('common/js/PieceList');

describe('piece list tests', () => {
  let pieceList;
  let newPieces;

  beforeEach(() => {
    pieceList = new PieceList();
    newPieces = new Array(20).fill(0);
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
      pieceList.addSet(newPieces);

      expect(pieceList.pieces).toEqual([newPieces]);
    });

    test('adds multiple new sets', () => {
      pieceList.addSet(newPieces);
      pieceList.addSet(newPieces);

      expect(pieceList.pieces).toEqual([newPieces, newPieces]);
    });
  });

  describe('current set iteration', () => {
    test('increases current set after iterating through previous set', () => {
      pieceList.addSet(newPieces);
      pieceList.addSet(newPieces);

      pieceList.currIdx = newPieces.length - 2;
      pieceList.getNextPiece();

      expect(pieceList.currIdx).toBe(newPieces.length - 1);
      expect(pieceList.currSet).toBe(0);

      pieceList.getNextPiece();

      expect(pieceList.currIdx).toBe(0);
      expect(pieceList.currSet).toBe(1);
    });
  });

  describe('almost empty', () => {
    test('true when nearing end of current sets', () => {
      pieceList.addSet(newPieces);

      expect(pieceList.almostEmpty()).toBe(false);

      pieceList.currIdx = 5;

      expect(pieceList.almostEmpty()).toBe(true);
    });

    test('only true if the current set is the last set', () => {
      pieceList.addSet(newPieces);
      pieceList.addSet(newPieces);

      pieceList.currIdx = 5;

      expect(pieceList.almostEmpty()).toBe(false);

      pieceList.currSet = 1;

      expect(pieceList.almostEmpty()).toBe(true);
    });
  });
});
