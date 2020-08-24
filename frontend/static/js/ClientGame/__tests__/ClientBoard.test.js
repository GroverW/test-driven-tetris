const ClientBoard = require('frontend/static/js/ClientGame/ClientBoard');
const gameLoop = require('frontend/static/js/GameLoop');
const Animation = require('frontend/static/js/Command/Animation');
const AnimateAddToBoard = require('frontend/static/js/Command/Animation/AnimateAddToBoard');
const AnimateClearLines = require('frontend/static/js/Command/Animation/AnimateClearLines');
const Command = require('frontend/static/js/Command');
const { ROTATE_LEFT } = require('frontend/constants');
const { DRAW, START_GAME, SET_COMMAND, CLEAR_QUEUE } = require('frontend/topics');
const {
  getTestBoard, getTestPiece, getTestPieces, pubSubMock, mockAnimation, mockCancelAnimation,
} = require('frontend/mocks');
const pubSub = require('frontend/helpers/pubSub');

describe('client - game board tests', () => {
  let gameBoard;
  let p1;
  let pubSubSpy;

  beforeEach(() => {
    gameBoard = new ClientBoard(pubSub);
    gameBoard.pieceList.pieces.push(getTestPieces());
    p1 = getTestPiece('I');
    gameBoard.piece = p1;
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    pubSubSpy.unsubscribe();
  });

  test('publishes CLEAR_QUEUE when getting pieces', () => {
    const clearQueueSpy = pubSubSpy.add(CLEAR_QUEUE);

    gameBoard.getPieces();

    expect(clearQueueSpy).toHaveBeenCalledTimes(1);
  });

  test('publishes on points from movement', () => {
    const drawSpy = pubSubSpy.add(DRAW);

    gameBoard.movePiece(1, 0);

    expect(drawSpy).toHaveBeenCalledTimes(1);

    gameBoard.movePiece(0, 1);

    expect(drawSpy).toHaveBeenCalledTimes(2);
  });

  describe('drop piece', () => {
    let setCommandSpy;

    beforeEach(() => {
      setCommandSpy = pubSubSpy.add(SET_COMMAND);
      gameBoard.nextPiece = getTestPiece('O');
      gameLoop.initialize(1);
      jest.useFakeTimers();
      requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
      cancelAnimationFrame = jest.fn().mockImplementation(mockCancelAnimation);
      gameLoop[START_GAME]();
    });

    afterEach(() => {
      jest.clearAllMocks();
      gameLoop.gameOverAction();
    });

    test('adds piece to board, sends AnimateAddToBoard and getPieces to gameLoop', () => {
      const addToBoardSpy = jest.spyOn(gameBoard, 'addPieceToBoard');

      gameBoard.hardDrop();

      expect(addToBoardSpy).toHaveBeenCalledTimes(1);
      expect(setCommandSpy).toHaveBeenLastCalledWith(expect.any(Animation));
      expect(gameLoop.animation.steps).toEqual(
        [expect.any(AnimateAddToBoard), expect.any(Command), expect.any(Command)],
      );

      jest.advanceTimersByTime(1000);

      expect(gameBoard.piece).toEqual(getTestPiece('O'));
      expect(gameLoop.animation).toBe(undefined);
    });

    test('also clears lines and replaces board when lines are cleared', () => {
      const addToBoardSpy = jest.spyOn(gameBoard, 'addPieceToBoard');
      const updateBoardStateSpy = jest.spyOn(gameBoard, 'updateBoardState');

      gameBoard.grid = getTestBoard('clearLines2');
      gameBoard.rotatePiece(ROTATE_LEFT);
      gameBoard.hardDrop();

      expect(addToBoardSpy).toHaveBeenCalledTimes(1);
      expect(updateBoardStateSpy).toHaveBeenCalledTimes(0);
      expect(setCommandSpy).toHaveBeenLastCalledWith(expect.any(Animation));
      expect(gameLoop.animation.steps).toEqual([
        expect.any(AnimateAddToBoard),
        expect.any(AnimateClearLines),
        expect.any(Command),
        expect.any(Command),
        expect.any(Command),
      ]);

      jest.advanceTimersByTime(2000);

      expect(updateBoardStateSpy).toHaveBeenCalledTimes(1);
      expect(gameBoard.piece).toEqual(getTestPiece('O'));
      expect(gameLoop.animation).toBe(undefined);
      expect(gameBoard.grid).toEqual(getTestBoard('clearLines2Cleared3'));
    });
  });

  test('publish boards updates when board gets replaced', () => {
    const newBoard = getTestBoard('pattern3');

    const drawSpy = pubSubSpy.add(DRAW);

    gameBoard.replaceBoard(newBoard);

    expect(drawSpy).toHaveBeenCalledTimes(1);
  });

  test('validates whether piece has reached lowest point', () => {
    gameBoard.movePiece(0, 1, 0);

    expect(gameBoard.isPieceAtLowestPoint()).toBe(true);

    gameBoard.movePiece(0, -1, 0);

    expect(gameBoard.isPieceAtLowestPoint()).toBe(false);
  });
});
