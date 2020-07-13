const Game = require('common/js/Game');
const Board = require('common/js/Board');
const Piece = require('common/js/Piece');
const {
  LINES_PER_LEVEL,
  PIECE_TYPES,
  POINTS,
} = require('common/helpers/constants');
const { LOWER_PIECE, CLEAR_LINES, END_GAME } = require('common/helpers/commonTopics');
const {
  getTestBoard,
  getTestPieces,
} = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1;
  let pubSubTest;

  beforeAll(() => {
    pubSubTest = pubSub();
    game = new Game(1, pubSubTest, Board);
    game.addPieces(getTestPieces());
  });

  afterAll(() => {
    game.unsubscribe();
  });

  beforeEach(() => {
    p1 = new Piece(PIECE_TYPES.I);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start game', () => {
    test('start game', () => {
      expect([game.score, game.level, game.lines]).toEqual([0, 1, 0]);
      expect(game.board.grid).toEqual(getTestBoard('empty'));

      expect(game.board.piece).not.toEqual(expect.any(Piece));
      expect(game.board.nextPiece).not.toEqual(expect.any(Piece));

      game.start();

      expect(game.board.piece).toEqual(expect.any(Piece));
      expect(game.board.nextPiece).toEqual(expect.any(Piece));
    });
  });

  describe('score points', () => {
    test('score points by moving piece down', () => {
      game.board.piece = p1;

      game.board.movePiece(0, 10);

      // expected score is 10
      expect(game.score).toBe(10);

      game.board.movePiece(0, 5);

      expect(game.score).toBe(15);
    });

    test('score points for single line', () => {
      const currScore = game.score;

      game.clearLines(1);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[1]);
    });

    test('score points for double line', () => {
      const currScore = game.score;

      game.clearLines(2);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[2]);
    });

    test('score points for triple line', () => {
      const currScore = game.score;

      game.clearLines(3);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[3]);
    });

    test('score points for tetris', () => {
      const currScore = game.score;

      game.clearLines(4);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[4]);
    });

    test('score points with level modifier', () => {
      const currScore = game.score;

      game.level = 2;
      game.clearLines(2);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[2] * game.level);
    });
  });

  describe('clear lines', () => {
    test('clearing lines updates lines cleared and lines remaining', () => {
      const currLines = game.lines;
      const currRemain = game.linesRemaining;

      game.clearLines(1);

      const expectedRemaining = currRemain === 1 ? LINES_PER_LEVEL : currRemain - 1;

      expect(game.lines).toBe(currLines + 1);
      expect(game.linesRemaining).toBe(expectedRemaining);
    });

    test('clearing lines updates level', () => {
      const currLevel = game.level;

      for (let i = 0; i < 3; i += 1) game.clearLines(4);

      expect(game.level).toBe(currLevel + 1);
    });
  });

  describe('publish / subscribe', () => {
    test('LOWER_PIECE updates score', () => {
      const currScore = game.score;

      pubSubTest.publish(LOWER_PIECE, 5);

      expect(game.score).toBe(currScore + 5);
    });

    test('CLEAR_LINES updates lines and score', () => {
      const currScore = game.score;
      const currLines = game.lines;

      pubSubTest.publish(CLEAR_LINES, 1);

      expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[1] * game.level);
      expect(game.lines).toBe(currLines + 1);
    });

    test('END_GAME should unsubscribe and publishing should stop updating game', () => {
      const currScore = game.score;
      const currLines = game.lines;

      pubSubTest.publish(END_GAME);

      pubSubTest.publish(CLEAR_LINES, 1);
      pubSubTest.publish(LOWER_PIECE, 1);

      expect(game.score).toBe(currScore);
      expect(game.lines).toBe(currLines);
    });
  });
});
