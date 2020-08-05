const Game = require('common/js/Game');
const Board = require('common/js/Board');
const Piece = require('common/js/Piece');
const { LINES_PER_LEVEL, POINTS } = require('common/constants');
const { ADD_PIECES, LOWER_PIECE, CLEAR_LINES, END_GAME} = require('common/topics');
const { getTestBoard, getTestPiece, getTestPieces } = require('common/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    game = new Game(1, pubSubTest, Board);
    game.addPieces(getTestPieces());
    p1 = getTestPiece('I');
  });

  afterEach(() => {
    game.unsubscribe();
    jest.clearAllMocks();
  });

  describe('start game', () => {
    test('start game', () => {
      const getPiecesSpy = jest.spyOn(game.board, 'getPieces');
      expect([game.score, game.level, game.lines]).toEqual([0, 1, 0]);
      expect(game.board.grid).toEqual(getTestBoard('empty'));

      expect(game.board.piece).not.toEqual(expect.any(Piece));
      expect(game.board.nextPiece).not.toEqual(expect.any(Piece));

      game.start();

      expect(getPiecesSpy).toHaveBeenCalledTimes(1);
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

    test('adds points correctly', () => {
      let currScore = game.score;

      [1, 2, 3, 4].forEach((linesCleared) => {
        game.clearLines(linesCleared);
        expect(game.score).toBe(currScore + POINTS.LINES_CLEARED[linesCleared]);
        currScore = game.score;
      });
    });

    test('score points with level modifier', () => {
      game.level = 2;
      game.clearLines(2);

      expect(game.score).toBe(POINTS.LINES_CLEARED[2] * game.level);
    });
  });

  describe('clear lines', () => {
    test('updates lines and lines remaining', () => {
      game.start();
      const currLinesRemaining = game.linesRemaining;
      const currLines = game.lines;

      game.updateLinesRemaining(1);

      expect(game.linesRemaining).toBe(currLinesRemaining - 1);
      expect(game.lines).toBe(currLines + 1);
    });

    test('updating lines remaining updates level', () => {
      game.start();
      const currLinesRemaining = game.linesRemaining;
      const currLevel = game.level;

      game.updateLinesRemaining(LINES_PER_LEVEL);

      expect(game.level).toBe(currLevel + 1);
      expect(game.linesRemaining).toBe(currLinesRemaining);
    });

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
    test('ADD_PIECES gets new pieces', () => {
      const numSets = game.board.pieceList.pieces.length;
      const addSetSpy = jest.spyOn(game.board.pieceList, 'addSet');

      pubSubTest.publish(ADD_PIECES, [1, 2, 3]);

      expect(game.board.pieceList.pieces.length).toBe(numSets + 1);
      expect(addSetSpy).toHaveBeenCalledTimes(1);
    });

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
