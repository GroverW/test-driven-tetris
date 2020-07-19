const Board = require('common/js/Board');
const Piece = require('common/js/Piece');
const {
  PIECES, PIECE_TYPES, ROTATE_LEFT, ROTATE_RIGHT, MAX_FLOOR_KICKS,
} = require('common/helpers/constants');
const { TEST_BOARDS, getTestBoard, getTestPieces } = require('common/mockData/mocks');
const pubSub = require('frontend/helpers/pubSub');

const movePieceTo = (gameBoard, location) => {
  const movementTowards = {
    left: [-1, 0],
    right: [1, 0],
    top: [0, -1],
    bottom: [0, 1],
  };
  const direction = movementTowards[location];

  while (gameBoard.validMove(...direction)) gameBoard.movePiece(...direction, 0);
};

describe('game board tests', () => {
  let gameBoard;
  let p1; let p2; let p3; let p4; let
    p5;

  beforeEach(() => {
    gameBoard = new Board(pubSub);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.O);
    p3 = new Piece(PIECE_TYPES.T);
    p4 = new Piece(PIECE_TYPES.L);
    p5 = new Piece(PIECE_TYPES.J);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('creates a new, empty board', () => {
      expect(gameBoard.grid).toEqual(TEST_BOARDS.empty);
    });

    test('gets new piece', () => {
      expect(gameBoard.piece).toBe(undefined);
      expect(gameBoard.nextPiece).toBe(undefined);

      gameBoard.getPieces();

      expect(PIECES[gameBoard.piece.type]).toContainEqual(gameBoard.piece.grid);
      expect(PIECES[gameBoard.nextPiece.type]).toContainEqual(gameBoard.nextPiece.grid);
    });
  });

  describe('movement / rotation', () => {
    describe('movement validation', () => {
      test('moves piece only to valid position', () => {
        gameBoard.piece = p2;
        expect([p2.x, p2.y]).toEqual([4, 0]);

        gameBoard.movePiece(-1, 0);
        expect([p2.x, p2.y]).toEqual([3, 0]);

        p2.move(-3, 0);
        expect([p2.x, p2.y]).toEqual([0, 0]);

        gameBoard.movePiece(-1, 0);
        expect([p2.x, p2.y]).toEqual([0, 0]);
      });
    });

    describe('validation', () => {
      test('validates piece movement', () => {
        gameBoard.piece = p1;

        expect(gameBoard.validMove(0, 0)).toBe(true);
        expect(gameBoard.validMove(0, 18)).toBe(true);
        expect(gameBoard.validMove(3, 0)).toBe(true);
        expect(gameBoard.validMove(-3, 0)).toBe(true);
        expect(gameBoard.validMove(0, -2)).toBe(false);
        expect(gameBoard.validMove(0, 20)).toBe(false);
        expect(gameBoard.validMove(-5, 0)).toBe(false);
        expect(gameBoard.validMove(5, 0)).toBe(false);
      });

      test('gets piece bounds', () => {
        gameBoard.piece = p1;

        let bounds = gameBoard.getPieceBounds();

        expect(bounds).toEqual([1, 1, 3, 6]);

        gameBoard.rotatePiece(-1);

        bounds = gameBoard.getPieceBounds();

        expect(bounds).toEqual([0, 3, 4, 4]);
      });
    });

    describe('wall kick', () => {
      test('wall kicks against left side', () => {
        gameBoard.piece = p1;
        expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([3, 0]);

        gameBoard.rotatePiece(ROTATE_LEFT);
        movePieceTo(gameBoard, 'left');

        expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([-1, 0]);

        gameBoard.rotatePiece(ROTATE_RIGHT);

        expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([0, 0]);
      });

      test('wall kicks against right side', () => {
        gameBoard.piece = p1;
        expect([gameBoard.piece.x, gameBoard.piece.y]).toEqual([3, 0]);

        gameBoard.rotatePiece(ROTATE_LEFT);
        movePieceTo(gameBoard, 'right');

        let pieceEdge = gameBoard.piece.x + gameBoard.piece.grid[0].length;
        const boardEdge = gameBoard.grid[0].length;

        expect(pieceEdge).toBeGreaterThan(boardEdge);

        gameBoard.rotatePiece(ROTATE_LEFT);

        pieceEdge = gameBoard.piece.x + gameBoard.piece.grid[0].length;

        expect(pieceEdge).toBe(boardEdge);
      });

      test('MAX_FLOOR_KICKS - stops floor kicking after limit reached', () => {
        const wallKickSpy = jest.spyOn(gameBoard, 'wallKick');
        const totalTests = MAX_FLOOR_KICKS * 5;

        gameBoard.piece = p4;

        for (let i = 0; i < totalTests; i += 1) {
          movePieceTo(gameBoard, 'bottom');
          gameBoard.rotatePiece(ROTATE_LEFT);
        }

        expect(wallKickSpy.mock.results.reduce((tot, res) => tot + (res.value === true), 0))
          .toBeLessThan(totalTests);
      });

      test('resets remaining wall kicks on getting new piece', () => {
        gameBoard.piece = p4;

        movePieceTo(gameBoard, 'bottom');
        for (let i = 0; i < 4; i += 1) gameBoard.rotatePiece(ROTATE_LEFT);

        expect(gameBoard.floorKicksRemaining).toBe(MAX_FLOOR_KICKS - 1);

        gameBoard.getPieces();

        expect(gameBoard.floorKicksRemaining).toBe(MAX_FLOOR_KICKS);
      });
    });

    describe('hard drop', () => {
      test('hard drops piece', () => {
        gameBoard.piece = p1;

        gameBoard.hardDrop();

        expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
      });

      test('hard drop piece with obstacles', () => {
        gameBoard.piece = p1;
        gameBoard.movePiece(-1, 0);
        gameBoard.rotatePiece(ROTATE_LEFT);
        gameBoard.hardDrop();

        expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern2);

        gameBoard.piece = p4;
        gameBoard.hardDrop();

        expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern3);

        gameBoard.piece = p2;
        gameBoard.hardDrop();

        expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern4);

        gameBoard.piece = p3;
        gameBoard.rotatePiece(ROTATE_RIGHT);
        gameBoard.movePiece(2, 0);
        gameBoard.hardDrop();

        expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern5);
      });
    });
  });

  describe('add piece to board', () => {
    test('drop piece if invalid move down', () => {
      gameBoard.piece = p1;
      gameBoard.movePiece(0, 18);

      expect(gameBoard.grid).toEqual(TEST_BOARDS.empty);
      expect([p1.x, p1.y]).toEqual([3, 18]);

      // don't drop piece if down key used (only auto_down or hard_drop)
      gameBoard.movePiece(0, 1);
      expect(gameBoard.grid).toEqual(TEST_BOARDS.empty);

      // if multiplier not same as down key, then drop
      gameBoard.movePiece(0, 1, 0);

      expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
      expect([p1.x, p1.y]).toEqual([3, 18]);

      // don't drop piece if invalid horizontal move
      gameBoard.piece = p2;
      gameBoard.movePiece(-4, 0);

      expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
      expect([p2.x, p2.y]).toEqual([0, 0]);

      gameBoard.movePiece(-1, 0);

      expect(gameBoard.grid).toEqual(TEST_BOARDS.pattern1);
      expect([p2.x, p2.y]).toEqual([0, 0]);
    });

    test('gets new piece on drop', () => {
      gameBoard.getPieces();

      const currPiece = gameBoard.piece;
      const { nextPiece } = gameBoard;

      gameBoard.hardDrop();

      expect(gameBoard.piece).not.toBe(currPiece);
      expect(gameBoard.piece).toBe(nextPiece);
      expect(gameBoard.nextPiece).toEqual(expect.any(Piece));
    });
  });

  describe('clear lines', () => {
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
      gameBoard.movePiece(3, 0);
      gameBoard.hardDrop();

      expect(gameBoard.grid).toEqual(TEST_BOARDS.clearLines3Cleared);
    });
  });

  test('replace board - swaps board with new board', () => {
    gameBoard.grid = getTestBoard('empty');
    gameBoard.piece = p1;

    gameBoard.movePiece(0, 10);

    expect([p1.x, p1.y]).toEqual([3, 10]);

    const newBoard = getTestBoard('pattern3');

    gameBoard.replaceBoard(newBoard);

    expect(gameBoard.grid).toEqual(newBoard);
    // should maintain a 5 row gap between piece and new board filled spots
    expect([p1.x, p1.y]).toEqual([3, 8]);

    const fullBoard = getTestBoard('fullBoard');

    gameBoard.replaceBoard(fullBoard);

    expect(gameBoard.grid).toEqual(fullBoard);
    expect([p1.x, p1.y]).toEqual([3, -1]);
  });
});
