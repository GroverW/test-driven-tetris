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
    gameView = new GameView(mockCtx);
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

  test('draw board', () => {
    const ctxSpy = jest.spyOn(gameView.ctx, 'rect');

    game.start();
    
    expect(ctxSpy).toHaveBeenCalled();
  })
});