const GameView = require('frontend/static/js/GameDOM/GameView');
const gameLoop = require('frontend/static/js/GameLoop');

const {
  CONTROLS, BOARD_HEIGHT, BOARD_WIDTH, CELL_SIZE,
} = require('frontend/constants');
const {
  START_GAME, DRAW, REMOVE_PLAYER, UPDATE_PLAYER, END_GAME,
} = require('frontend/topics');
const {
  getMockCtx,
  getTestBoard,
  getTestPiece,
  getNewTestGame,
  runCommands,
  mockAnimation,
  mockCancelAnimation,
  clearMocksAndUnsubscribe,
} = require('frontend/mocks');
const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer, getNextPieceBoard } = require('frontend/helpers/utils');

describe('game view tests', () => {
  let gameView;
  let game;
  let mockCtx; let mockCtxNext;
  let newCtx1; let newBoard1; let newId1;
  let newCtx2; let newBoard2; let newId2;
  let newPlayer1; let newPlayer2;
  let drawGrid; let drawNext;

  beforeEach(() => {
    mockCtx = getMockCtx();
    mockCtxNext = getMockCtx();
    newCtx1 = getMockCtx();
    newBoard1 = getTestBoard('empty');
    newId1 = 2;
    newCtx2 = getMockCtx();
    newBoard2 = getTestBoard('empty');
    newId2 = 3;

    newPlayer1 = getNewPlayer(newCtx1, newBoard1, newId1);
    newPlayer2 = getNewPlayer(newCtx2, newBoard2, newId2);

    game = getNewTestGame();
    gameLoop.initialize(2);
    gameView = new GameView(mockCtx, getTestBoard('empty'), mockCtxNext, getNextPieceBoard());
    drawGrid = jest.spyOn(gameView.player, 'drawGrid');
    drawNext = jest.spyOn(gameView.nextPiece, 'clearAndDrawCentered');
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
    cancelAnimationFrame = jest.fn().mockImplementation(mockCancelAnimation);
  });

  afterEach(() => {
    clearMocksAndUnsubscribe(game, gameView, gameLoop);
  });

  describe('draw elements', () => {
    test('draw elements on game start', () => {
      expect(gameView.player.ctx.canvas.width).toBe(BOARD_WIDTH * CELL_SIZE);
      expect(gameView.player.ctx.canvas.height).toBe(BOARD_HEIGHT * CELL_SIZE);
      expect(gameView.nextPiece.ctx.canvas.width).toBe(4 * CELL_SIZE);
      expect(gameView.nextPiece.ctx.canvas.height).toBe(4 * CELL_SIZE);

      expect(drawGrid).toHaveBeenCalledTimes(0);

      game[START_GAME]();
      gameLoop[START_GAME]();

      // 1 for board, 1 for piece
      expect(drawGrid).toHaveBeenCalledTimes(2);
      expect(drawNext).toHaveBeenCalledTimes(1);
    });

    test('draw elements on piece rotate', () => {
      game[START_GAME]();
      gameLoop[START_GAME]();

      expect(drawGrid).toHaveBeenCalledTimes(2);
      expect(drawNext).toHaveBeenCalledTimes(1);

      runCommands(game, CONTROLS.ROTATE_LEFT);

      // board and piece updated on rotate
      expect(drawGrid).toHaveBeenCalledTimes(4);
      expect(drawNext).toHaveBeenCalledTimes(1);
    });

    test('only draw nextPiece when piece dropped', () => {
      game[START_GAME]();
      gameLoop[START_GAME]();

      expect(drawGrid).toHaveBeenCalledTimes(2);
      expect(drawNext).toHaveBeenCalledTimes(1);

      runCommands(game, CONTROLS.HARD_DROP);

      // when a new piece is grabbed, board, piece and nextPiece
      // should be drawn
      expect(drawGrid).toHaveBeenCalledTimes(4);
      expect(drawNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('add / remove players', () => {
    test('add new player', () => {
      expect(gameView.players.length).toBe(0);

      expect(drawGrid).toHaveBeenCalledTimes(0);

      gameView.addPlayer(newPlayer1);

      expect(gameView.players.length).toBe(1);
      expect(gameView.players[0].ctx).toBe(newPlayer1.ctx);
      expect(gameView.players[0].board).toBe(newPlayer1.board);
      expect(gameView.players[0].id).toBe(newPlayer1.id);
    });

    test('adding 3rd player rescales player 2 board', () => {
      const fullWidth = BOARD_WIDTH * CELL_SIZE;
      const fullHeight = BOARD_HEIGHT * CELL_SIZE;
      const halfWidth = (BOARD_WIDTH * CELL_SIZE) / 2;
      const halfHeight = (BOARD_HEIGHT * CELL_SIZE) / 2;
      const fullCell = CELL_SIZE;
      const halfCell = CELL_SIZE / 2;

      gameView.addPlayer(newPlayer1);
      expect(gameView.players.length).toBe(1);

      const scaleBoardSpy = jest.spyOn(gameView.players[0], 'scaleBoardSize');
      expect(scaleBoardSpy).toHaveBeenCalledTimes(0);

      let {
        width, height, xScale, yScale,
      } = gameView.players[0].ctx.canvas;
      expect([width, height, xScale, yScale]).toEqual([fullWidth, fullHeight, fullCell, fullCell]);

      gameView.addPlayer(newPlayer2);

      expect(gameView.players.length).toBe(2);
      // once to add new player, once to rescale player2 board
      expect(scaleBoardSpy).toHaveBeenCalledTimes(1);

      ({
        width, height, xScale, yScale,
      } = gameView.players[0].ctx.canvas);
      expect([width, height, xScale, yScale]).toEqual([halfWidth, halfHeight, halfCell, halfCell]);
      ({
        width, height, xScale, yScale,
      } = gameView.players[1].ctx.canvas);
      expect([width, height, xScale, yScale]).toEqual([halfWidth, halfHeight, halfCell, halfCell]);
    });

    test('remove player', () => {
      gameView.addPlayer(newPlayer1);
      gameView.addPlayer(newPlayer2);

      expect(gameView.players.length).toBe(2);

      gameView.removePlayer(newId1);

      expect(gameView.players.length).toBe(1);
      expect(gameView.players[0].id).toBe(newId2);
    });

    test('removing 3rd player rescales player 2 board', () => {
      const fullWidth = BOARD_WIDTH * CELL_SIZE;
      const fullHeight = BOARD_HEIGHT * CELL_SIZE;
      const halfWidth = (BOARD_WIDTH * CELL_SIZE) / 2;
      const halfHeight = (BOARD_HEIGHT * CELL_SIZE) / 2;

      gameView.addPlayer(newPlayer1);

      expect(gameView.players.length).toBe(1);

      gameView.addPlayer(newPlayer2);

      expect(gameView.players.length).toBe(2);

      let { width, height } = gameView.players[0].ctx.canvas;
      expect([width, height]).toEqual([halfWidth, halfHeight]);

      ({ width, height } = gameView.players[1].ctx.canvas);
      expect([width, height]).toEqual([halfWidth, halfHeight]);

      gameView.removePlayer(newId1);

      expect(gameView.players.length).toBe(1);

      ({ width, height } = gameView.players[0].ctx.canvas);
      expect([width, height]).toEqual([fullWidth, fullHeight]);
    });
  });

  describe('publish / subscribe', () => {
    describe('DRAW', () => {
      test('calls draw on publish', () => {
        const testBoard = getTestBoard('pattern1');

        publish(DRAW, { board: testBoard });

        expect(drawGrid).toHaveBeenCalledTimes(1);
      });

      test('draws board if board included', () => {
        const drawGridSpy = jest.spyOn(gameView.player, 'drawGrid');
        const drawNextPieceSpy = jest.spyOn(gameView.nextPiece, 'clearAndDrawCentered');

        const testBoard = getTestBoard('pattern1');

        publish(DRAW, { board: testBoard });

        expect(drawGridSpy).toHaveBeenCalledTimes(1);
        expect(drawGridSpy).toHaveBeenLastCalledWith(testBoard);
        expect(drawNextPieceSpy).toHaveBeenCalledTimes(0);
      });

      test('draws piece if piece included', () => {
        const drawGridSpy = jest.spyOn(gameView.player, 'drawGrid');
        const drawNextPieceSpy = jest.spyOn(gameView.nextPiece, 'clearAndDrawCentered');

        const testPiece = getTestPiece('I');
        const { grid, x, y } = testPiece;

        publish(DRAW, { piece: testPiece });

        expect(drawGridSpy).toHaveBeenCalledTimes(1);
        expect(drawGridSpy).toHaveBeenLastCalledWith(grid, undefined, x, y);
        expect(drawNextPieceSpy).toHaveBeenCalledTimes(0);
      });

      test('draws nextPiece if nextPiece included', () => {
        const drawGridSpy = jest.spyOn(gameView.player, 'drawGrid');
        const drawNextPieceSpy = jest.spyOn(gameView.nextPiece, 'clearAndDrawCentered');

        const testPiece = getTestPiece('I');
        const { grid } = testPiece;

        publish(DRAW, { nextPiece: testPiece });

        expect(drawNextPieceSpy).toHaveBeenCalledTimes(1);
        expect(drawNextPieceSpy).toHaveBeenLastCalledWith(grid);
        expect(drawGridSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('REMOVE_PLAYER', () => {
      beforeEach(() => {
        gameView.addPlayer(newPlayer1);
      });

      test('removes player on publish', () => {
        publish(REMOVE_PLAYER, newId1);

        expect(gameView.players.length).toBe(0);
      });

      test('does not remove player if id does not match', () => {
        publish(REMOVE_PLAYER, newId2);

        expect(gameView.players.length).toBe(1);
      });
    });

    describe('UPDATE_PLAYER', () => {
      beforeEach(() => {
        gameView.addPlayer(newPlayer1);
      });

      test('updates player board on publish', () => {
        const testBoard = getTestBoard('pattern1');
        const drawGridSpy = jest.spyOn(gameView.players[0], 'drawGrid');

        expect(gameView.players.length).toBe(1);
        expect(drawGridSpy).toHaveBeenCalledTimes(0);
        expect(gameView.players[0].board).toEqual(getTestBoard('empty'));

        publish(UPDATE_PLAYER, { id: newId1, board: testBoard });

        expect(gameView.players[0].board).toEqual(testBoard);
        expect(drawGridSpy).toHaveBeenCalledTimes(1);
      });

      test('does not update player if id does not match', () => {
        const testBoard = getTestBoard('pattern1');
        const emptyBoard = getTestBoard('empty');
        const drawGridSpy = jest.spyOn(gameView.players[0], 'drawGrid');

        expect(gameView.players.length).toBe(1);
        expect(drawGridSpy).toHaveBeenCalledTimes(0);
        expect(gameView.players[0].board).toEqual(emptyBoard);

        publish(UPDATE_PLAYER, { id: 'fake', board: testBoard });

        expect(gameView.players[0].board).toEqual(emptyBoard);
        expect(drawGridSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('END_GAME', () => {
      test('publishing should stop updating game view on game end', () => {
        const testBoard = getTestBoard('pattern1');
        gameView.addPlayer(newPlayer1);

        publish(END_GAME);

        publish(DRAW, { board: testBoard });
        publish(UPDATE_PLAYER, { id: newId1, board: testBoard });
        publish(REMOVE_PLAYER, newId1);

        expect(gameView.players.length).toBe(1);
        expect(drawGrid).toHaveBeenCalledTimes(0);
      });
    });
  });
});
