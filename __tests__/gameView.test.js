const GameView = require('../gameView')
const Game = require('../game');
const { Piece } = require ('../piece');
const { PIECES, CONTROLS,  } = require('../data');
const { TEST_BOARDS } = require('./helpers/testData');
const { publish } = require('../pubSub');

describe('game view tests', () => {
  let game;
  let p1, p2, p3;
  let mockCtx

  beforeEach(() => {
    mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      rect: jest.fn()
    }

    game = new Game();
    gameView = new GameView(mockCtx, mockCtx);
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[6]);
    p3 = new Piece(PIECES[2]);
  })

  afterEach(() => {
    jest.clearAllMocks();
    game.unsubDrop();
    game.unsubClear();
    game.unsubGame();
    gameView.unsubDraw();
  });

  test('draw elements on game start', () => {
    const drawBoardSpy = jest.spyOn(gameView, 'drawBoard');
    const drawPieceSpy = jest.spyOn(gameView, 'drawPiece');

    game.start();
    
    expect(drawBoardSpy).toHaveBeenCalled();
    expect(drawPieceSpy).toHaveBeenCalledTimes(2);
  });

  test('only draw board and piece until piece dropped', () => {
    game.start();
    
    const drawBoardSpy = jest.spyOn(gameView, 'drawBoard');
    const drawPieceSpy = jest.spyOn(gameView, 'drawPiece');

    expect(drawBoardSpy).not.toHaveBeenCalled();
    expect(drawPieceSpy).not.toHaveBeenCalled();

    game.command(CONTROLS.DOWN);

    expect(drawBoardSpy).toHaveBeenCalled();
    expect(drawPieceSpy).toHaveBeenCalledTimes(1);

    game.command(CONTROLS.HARD_DROP);

    expect(drawBoardSpy).toHaveBeenCalledTimes(2);
    expect(drawPieceSpy).toHaveBeenCalledTimes(3);
  });

});