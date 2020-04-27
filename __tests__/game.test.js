const Game = require('../game');
const { Piece } = require ('../piece');
const { PIECES, CONTROLS, BOARD_HEIGHT } = require('../data');
const { TEST_BOARDS } = require('./helpers/testData');
const { publish } = require('../pubSub');

describe('game tests', () => {
  let game;
  let p1;

  beforeEach(() => {
    game = new Game();
    p1 = new Piece(PIECES[0]);
  })

  test('start game', () => {
    expect([game.score, game.level, game.lines]).toEqual([0,1,0]);
    expect(game.board.grid).toEqual(TEST_BOARDS.empty);
    
    expect(game.board.piece).not.toEqual(expect.any(Piece));
    expect(game.board.nextPiece).not.toEqual(expect.any(Piece));

    game.start();

    expect(game.board.piece).toEqual(expect.any(Piece));
    expect(game.board.nextPiece).toEqual(expect.any(Piece));
  });

  test('keyboard controls', () => {
    game.board.piece = p1;

    expect([p1.x, p1.y]).toEqual([3,0]);

    game.command(CONTROLS.DOWN);

    expect([p1.x, p1.y]).toEqual([3,1]);

    game.command(CONTROLS.LEFT);

    expect([p1.x, p1.y]).toEqual([2,1]);

    game.command(CONTROLS.RIGHT);

    expect([p1.x, p1.y]).toEqual([3,1]);    

    expect(game.board.piece.grid).toEqual([
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ])

    game.command(CONTROLS.ROTATE_LEFT);

    expect(game.board.piece.grid).toEqual([
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
    ])

    game.command(CONTROLS.ROTATE_RIGHT);

    expect(game.board.piece.grid).toEqual([
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ])

    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.pattern1);
  });

  test('score points by moving piece down', () => {
    game.board.piece = p1;
    
    game.command(CONTROLS.HARD_DROP);

    // expected score is 36
    expect(game.score).toBe(36)

    game.command(CONTROLS.DOWN);
    
    expect(game.score).toBe(37)
  });

  test('score points by clearing lines', () => {

  });
});