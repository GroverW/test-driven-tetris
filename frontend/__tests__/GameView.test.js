const GameView = require('frontend/static/js/GameView');
const GameLoop = require('frontend/static/js/GameLoop');
const {
  CONTROLS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CELL_SIZE,
} = require('frontend/helpers/clientConstants');
const {
  START_GAME, DRAW, REMOVE_PLAYER, UPDATE_PLAYER,
} = require('frontend/helpers/clientTopics');
const {
  getMockCtx,
  getTestBoard,
  getNewTestGame,
  runCommand,
  mockAnimation,
} = require('frontend/mockData/mocks');
const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/clientUtils');

describe('game view tests', () => {
  let game;
  let gameLoop;
  let mockCtx; let
    mockCtxNext;
  let newCtx1; let newBoard1; let
    newId1;
  let newCtx2; let newBoard2; let
    newId2;
  let drawGridSpy; let
    drawNextSpy;
  let newPlayer1; let
    newPlayer2;

  beforeAll(() => {
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

    game = getNewTestGame(game);
    gameLoop = new GameLoop(2);
    gameView = new GameView(mockCtx, mockCtxNext);
  });

  afterAll(() => {
    game.unsubscribe();
    gameView.unsubscribe();
    gameLoop.unsubscribe();
  });

  beforeEach(() => {
    drawGridSpy = jest.spyOn(gameView, 'drawGrid');
    drawNextSpy = jest.spyOn(gameView, 'drawNext');
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('draw elements', () => {
    test('draw elements on game start', () => {
      expect(gameView.ctx.canvas.width).toBe(BOARD_WIDTH * CELL_SIZE);
      expect(gameView.ctx.canvas.height).toBe(BOARD_HEIGHT * CELL_SIZE);
      expect(gameView.ctxNext.canvas.width).toBe(4 * CELL_SIZE);
      expect(gameView.ctxNext.canvas.height).toBe(4 * CELL_SIZE);

      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      game[START_GAME]();
      gameLoop[START_GAME]();

      // 1 for board, 1 for piece, 1 for nextPiece
      expect(drawGridSpy).toHaveBeenCalledTimes(3);
      expect(drawNextSpy).toHaveBeenCalledTimes(1);
    });

    test('draw elements on piece rotate', () => {
      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      runCommand(game, CONTROLS.ROTATE_LEFT);

      // board and piece updated on rotate
      expect(drawGridSpy).toHaveBeenCalledTimes(2);
      expect(drawNextSpy).toHaveBeenCalledTimes(0);
    });

    test('only draw nextPiece when piece dropped', () => {
      runCommand(game, CONTROLS.DOWN);

      // redraw board and piece once per command
      expect(drawGridSpy).toHaveBeenCalledTimes(2);
      expect(drawNextSpy).toHaveBeenCalledTimes(0);

      runCommand(game, CONTROLS.HARD_DROP);

      // when a new piece is grabbed, board, piece and nextPiece
      // should be drawn
      expect(drawGridSpy).toHaveBeenCalledTimes(5);
      expect(drawNextSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('add / remove players', () => {
    test('add new player', () => {
      expect(gameView.players.length).toBe(0);

      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      gameView.addPlayer(newPlayer1);

      expect(gameView.players.length).toBe(1);

      expect(drawGridSpy).toHaveBeenCalledTimes(1);
    });

    test('adding 3rd player rescales player 2 board', () => {
      const fullWidth = BOARD_WIDTH * CELL_SIZE;
      const fullHeight = BOARD_HEIGHT * CELL_SIZE;
      const halfWidth = BOARD_WIDTH * CELL_SIZE / 2;
      const halfHeight = BOARD_HEIGHT * CELL_SIZE / 2;
      const fullCell = CELL_SIZE;
      const halfCell = CELL_SIZE / 2;

      expect(gameView.players.length).toBe(1);
      expect(drawGridSpy).toHaveBeenCalledTimes(0);

      let {
        width, height, xScale, yScale,
      } = gameView.players[0].ctx.canvas;
      expect([width, height, xScale, yScale]).toEqual([fullWidth, fullHeight, fullCell, fullCell]);

      gameView.addPlayer(newPlayer2);

      expect(gameView.players.length).toBe(2);
      // once to add new player, once to rescale player2 board
      expect(drawGridSpy).toHaveBeenCalledTimes(2);

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
      gameView.removePlayer(newId1);

      expect(gameView.players.length).toBe(1);
      expect(gameView.players[0].id).toBe(newId2);
    });

    test('removing 3rd player rescales player 2 board', () => {
      const fullWidth = BOARD_WIDTH * CELL_SIZE;
      const fullHeight = BOARD_HEIGHT * CELL_SIZE;
      const halfWidth = BOARD_WIDTH * CELL_SIZE / 2;
      const halfHeight = BOARD_HEIGHT * CELL_SIZE / 2;

      expect(gameView.players.length).toBe(1);

      gameView.addPlayer(newPlayer1);

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
    test('DRAW - calls draw', () => {
      const testBoard = getTestBoard('pattern1');
      const drawGridSpy = jest.spyOn(gameView, 'drawGrid');

      publish(DRAW, { board: testBoard });

      expect(drawGridSpy).toHaveBeenCalledTimes(1);
    });

    test('REMOVE_PLAYER - removes player', () => {
      expect(gameView.players.length).toBe(1);

      publish(REMOVE_PLAYER, newId2);

      expect(gameView.players.length).toBe(0);
    });

    test('UPDATE_PLAYER - updates player board', () => {
      const testBoard = getTestBoard('pattern1');

      gameView.addPlayer(newPlayer1);

      expect(gameView.players.length).toBe(1);
      expect(drawGridSpy).toHaveBeenCalledTimes(1);
      expect(gameView.players[0].board).toEqual(getTestBoard('empty'));

      publish(UPDATE_PLAYER, { id: newId1, board: testBoard });

      expect(gameView.players[0].board).toEqual(testBoard);
      expect(drawGridSpy).toHaveBeenCalledTimes(2);
    });

    test('unsubscribe - publishing should stop updating game view', () => {
      const testBoard = getTestBoard('pattern1');
      const drawGridSpy = jest.spyOn(gameView, 'drawGrid');

      gameView.unsubscribe();

      publish(DRAW, { board: testBoard });
      publish(UPDATE_PLAYER, { id: newId1, board: testBoard });
      publish(REMOVE_PLAYER, newId1);

      expect(gameView.players.length).toBe(1);
      expect(drawGridSpy).toHaveBeenCalledTimes(0);
    });
  });
});
