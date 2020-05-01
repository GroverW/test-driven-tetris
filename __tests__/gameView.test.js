const GameView = require('../static/js/gameView')
const Game = require('../static/js/game');
const { 
  CONTROLS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CELL_SIZE 
} = require('../static/js/data');
const { getMockCtx, getTestBoard } = require('./helpers/testData');

describe('game view tests', () => {
  let game;
  let mockCtx, mockCtxNext;
  let newCtx1, newBoard1, newId1;
  let newCtx2, newBoard2, newId2;
  let drawBoardSpy, drawPieceSpy;

  beforeEach(() => {
    mockCtx = getMockCtx();
    mockCtxNext = getMockCtx();
    newCtx1 = getMockCtx();
    newBoard1 = getTestBoard('empty');
    newId1 = 1;
    newCtx2 = getMockCtx();
    newBoard2 = getTestBoard('empty');
    newId2 = 2;

    game = new Game();
    gameView = new GameView(mockCtx, mockCtxNext);

    drawBoardSpy = jest.spyOn(gameView, 'drawBoard');
    drawPieceSpy = jest.spyOn(gameView, 'drawPiece');
    drawNextSpy = jest.spyOn(gameView, 'drawNext');
  })

  afterEach(() => {
    jest.clearAllMocks();
    game.unsubDrop();
    game.unsubClear();
    game.unsubGame();
    gameView.unsubDraw();
  });

  test('draw elements on game start', () => {
    expect(gameView.ctx.canvas.width).toBe(BOARD_WIDTH * CELL_SIZE);
    expect(gameView.ctx.canvas.height).toBe(BOARD_HEIGHT * CELL_SIZE);
    expect(gameView.ctxNext.canvas.width).toBe(4 * CELL_SIZE);
    expect(gameView.ctxNext.canvas.height).toBe(4 * CELL_SIZE);

    game.start();

    expect(drawBoardSpy).toHaveBeenCalledTimes(1);
    expect(drawPieceSpy).toHaveBeenCalledTimes(2);
    expect(drawNextSpy).toHaveBeenCalledTimes(1);
  });

  test('draw elements on piece rotate', () => {
    game.start();

    game.command(CONTROLS.ROTATE_LEFT);

    expect(drawBoardSpy).toHaveBeenCalledTimes(2);
    expect(drawPieceSpy).toHaveBeenCalledTimes(3);
    expect(drawNextSpy).toHaveBeenCalledTimes(1);
  });

  test('only draw nextPiece when piece dropped', () => {
    game.start();

    game.command(CONTROLS.DOWN);

    // redraw board and piece once per command
    expect(drawBoardSpy).toHaveBeenCalledTimes(2);
    expect(drawPieceSpy).toHaveBeenCalledTimes(3);
    expect(drawNextSpy).toHaveBeenCalledTimes(1);

    game.command(CONTROLS.HARD_DROP);

    // when a new piece is grabbed, board, piece and nextPiece
    // should be drawn
    expect(drawBoardSpy).toHaveBeenCalledTimes(3);
    expect(drawPieceSpy).toHaveBeenCalledTimes(5);
    expect(drawNextSpy).toHaveBeenCalledTimes(2);
  });

  test('add new player', () => {
    game.start();
    
    expect(gameView.players.length).toBe(0);

    gameView.addPlayer(newCtx1, newBoard1);

    expect(gameView.players.length).toBe(1);

    expect(drawBoardSpy).toHaveBeenCalledTimes(2);
    expect(drawPieceSpy).toHaveBeenCalledTimes(2);
    expect(drawNextSpy).toHaveBeenCalledTimes(1);
  });

  test('adding 3rd player rescales player 2 board', () => {
    game.start();
    const fullBoardWidth = BOARD_WIDTH * CELL_SIZE;
    const fullBoardHeight = BOARD_HEIGHT * CELL_SIZE;
    const halfBoardWidth = BOARD_WIDTH * CELL_SIZE / 2;
    const halfBoardHeight = BOARD_HEIGHT * CELL_SIZE / 2;
    const fullCell = CELL_SIZE;
    const halfCell = CELL_SIZE / 2;

    expect(gameView.players.length).toBe(0);
    expect(drawBoardSpy).toHaveBeenCalledTimes(1);
    
    
    gameView.addPlayer(newCtx1, newBoard1)
    
    expect(gameView.players.length).toBe(1);
    expect(drawBoardSpy).toHaveBeenCalledTimes(2);

    expect(gameView.players[0].ctx.canvas.width).toBe(fullBoardWidth);
    expect(gameView.players[0].ctx.canvas.height).toBe(fullBoardHeight);
    expect(gameView.players[0].ctx.canvas.xScale).toBe(fullCell);
    expect(gameView.players[0].ctx.canvas.yScale).toBe(fullCell);
    
    gameView.addPlayer(newCtx2, newBoard2);

    expect(gameView.players.length).toBe(2);
    expect(drawBoardSpy).toHaveBeenCalledTimes(4);

    expect(gameView.players[0].ctx.canvas.width).toBe(halfBoardWidth);
    expect(gameView.players[0].ctx.canvas.height).toBe(halfBoardHeight);
    expect(gameView.players[0].ctx.canvas.xScale).toBe(halfCell);
    expect(gameView.players[0].ctx.canvas.yScale).toBe(halfCell);
    expect(gameView.players[1].ctx.canvas.width).toBe(halfBoardWidth);
    expect(gameView.players[1].ctx.canvas.height).toBe(halfBoardHeight);
    expect(gameView.players[1].ctx.canvas.xScale).toBe(halfCell);
    expect(gameView.players[1].ctx.canvas.yScale).toBe(halfCell);

  })

  test('remove player', () => {
    game.start();
    
    expect(gameView.players.length).toBe(0);

    gameView.addPlayer(newCtx1, newBoard1, newId1)
    gameView.addPlayer(newCtx2, newBoard2, newId2)

    expect(gameView.players.length).toBe(2);

    gameView.removePlayer(newId1);

    expect(gameView.players.length).toBe(1);
    expect(gameView.players[0].id).toBe(2)
  });

  test('removing 3rd player rescales player 2 board', () => {
    game.start();
    const fullBoardWidth = BOARD_WIDTH * CELL_SIZE;
    const fullBoardHeight = BOARD_HEIGHT * CELL_SIZE;
    const halfBoardWidth = BOARD_WIDTH * CELL_SIZE / 2;
    const halfBoardHeight = BOARD_HEIGHT * CELL_SIZE / 2;
    
    expect(gameView.players.length).toBe(0);

    gameView.addPlayer(newCtx1, newBoard1, newId1)
    gameView.addPlayer(newCtx2, newBoard2, newId2)

    expect(gameView.players.length).toBe(2);
    expect(gameView.players[0].ctx.canvas.width).toBe(halfBoardWidth);
    expect(gameView.players[0].ctx.canvas.height).toBe(halfBoardHeight);
    expect(gameView.players[1].ctx.canvas.width).toBe(halfBoardWidth);
    expect(gameView.players[1].ctx.canvas.height).toBe(halfBoardHeight);

    gameView.removePlayer(newId1);

    expect(gameView.players.length).toBe(1);
    expect(gameView.players[0].ctx.canvas.width).toBe(fullBoardWidth);
    expect(gameView.players[0].ctx.canvas.height).toBe(fullBoardHeight);
  });
});