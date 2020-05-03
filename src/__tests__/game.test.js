const Game = require('../js/game');
const { Piece } = require ('../js/piece');
const { PIECES, CONTROLS  } = require('../helpers/data');
const { 
  TEST_BOARDS,
  getTestBoard,
} = require('../helpers/mocks');
const pubSub = require('../helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1, p2, p3;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    game = new Game(pubSubTest);
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[6]);
    p3 = new Piece(PIECES[2]);
  })

  afterEach(() => {
    jest.clearAllMocks();
    game.unsubDrop();
    game.unsubClear();
    game.unsubGame();
  });

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

    game.command('DOWN');

    expect([p1.x, p1.y]).toEqual([3,1]);

    game.command('LEFT');

    expect([p1.x, p1.y]).toEqual([2,1]);

    game.command('RIGHT');

    expect([p1.x, p1.y]).toEqual([3,1]);    

    expect(game.board.piece.grid).toEqual([
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ])

    game.command('ROTATE_LEFT');

    expect(game.board.piece.grid).toEqual([
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
    ])

    game.command('ROTATE_RIGHT');

    expect(game.board.piece.grid).toEqual([
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ])

    game.command('HARD_DROP');

    expect(game.board.grid).toEqual(TEST_BOARDS.pattern1);
  });

  test('score points by moving piece down', () => {
    game.board.piece = p1;
    
    game.command('HARD_DROP');

    // expected score is 36
    expect(game.score).toBe(36)

    game.command('DOWN');
    
    expect(game.score).toBe(37)
  });

  test('score points for single line', () => {
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;

    game.command('HARD_DROP')

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
    
    // I piece will hard drop 18. 36 + 100    
    expect(game.score).toBe(136)
  });
  
  test('score points for double line', () => {
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    expect(game.score).toBe(0);

    game.command('ROTATE_LEFT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('HARD_DROP');

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.score).toBe(332);
  });
  
  test('score points for triple line', () => {
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p1;

    expect(game.score).toBe(0);

    game.command('ROTATE_LEFT');    
    game.command('HARD_DROP');

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // I piece will hard drop 16. 32 + 500
    expect(game.score).toBe(532);
  });
  
  test('score points for tetris', () => {
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p3;
    game.board.nextPiece = p1;
    
    expect(game.score).toBe(0);

    game.command('ROTATE_LEFT');    
    game.command('ROTATE_LEFT');    
    game.command('LEFT');
    game.command('LEFT');
    game.command('HARD_DROP');

    game.command('ROTATE_LEFT');    
    game.command('HARD_DROP');

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

    // T will hard drop 14, I will hard drop 16
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(860);
  });

  test('score points with level modifier', () => {
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;
    game.level = 2;
    
    expect(game.score).toBe(0);

    game.command('HARD_DROP');

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
    
    // I piece will hard drop 18. 36 + 200
    expect(game.score).toBe(236);
  })

  test('clearing lines updates lines cleared', () => {
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    game.command('ROTATE_LEFT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('RIGHT');
    game.command('HARD_DROP')

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.lines).toBe(2)
  });

  test('clearing lines updates level', () => {
    expect(game.level).toBe(1);

    pubSubTest.publish('clearLines', 4);

    expect(game.linesRemaining).toBe(6);

    pubSubTest.publish('clearLines', 4);
    pubSubTest.publish('clearLines', 4);

    expect(game.level).toBe(2);
    expect(game.linesRemaining).toBe(8);

    pubSubTest.publish('clearLines', 4);
    pubSubTest.publish('clearLines', 4);

    expect(game.level).toBe(3);
  });

  test('game over', () => {
    game.board.grid = getTestBoard('empty');
    game.board.piece = new Piece(PIECES[0]);
    const gameOverSpy = jest.spyOn(game, 'unsubGame');
    const boardMoveSpy = jest.spyOn(game.board, 'movePiece')

    for(let i = 0; i < 5; i++) {
      game.board.nextPiece = new Piece(PIECES[0]);
      game.command('ROTATE_LEFT');
      game.command('HARD_DROP');
    }

    expect(boardMoveSpy).toHaveBeenCalledTimes(5);
    expect(gameOverSpy).toHaveBeenCalled();

    game.command('LEFT');
    // should not get called again
    expect(boardMoveSpy).toHaveBeenCalledTimes(5);

  })
});