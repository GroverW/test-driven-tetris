const Game = require('../game');
const { Piece } = require ('../piece');
const { PIECES, CONTROLS, BOARD_HEIGHT } = require('../data');
const { TEST_BOARDS } = require('./helpers/testData');
const { publish } = require('../pubSub');

describe('game tests', () => {
  let game;
  let p1, p2, p3;

  beforeEach(() => {
    game = new Game();
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[6]);
    p3 = new Piece(PIECES[2]);
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

  test('score points for single line', () => {
    game.board.grid = JSON.parse(JSON.stringify(TEST_BOARDS.clearLines1));
    game.board.piece = p1;

    game.command(CONTROLS.HARD_DROP)

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
    
    // I piece will hard drop 18. 36 + 100    
    expect(game.score).toBe(136)
  });
  
  test('score points for double line', () => {
    game.board.grid = JSON.parse(JSON.stringify(TEST_BOARDS.clearLines3));
    game.board.piece = p2;

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.HARD_DROP)

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.score).toBe(332)
  });
  
  test('score points for triple line', () => {
    game.board.grid = JSON.parse(JSON.stringify(TEST_BOARDS.clearLines2));
    game.board.piece = p1;

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.HARD_DROP)

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // I piece will hard drop 16. 32 + 500
    expect(game.score).toBe(532)
  });
  
  test('score points for tetris', () => {
    game.board.grid = JSON.parse(JSON.stringify(TEST_BOARDS.clearLines2));
    game.board.piece = p3;
    game.board.nextPiece = p1;

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.LEFT)
    game.command(CONTROLS.LEFT)
    game.command(CONTROLS.HARD_DROP)

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.HARD_DROP)

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

    // T will hard drop 14, I will hard drop 16
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(860)
  });
});