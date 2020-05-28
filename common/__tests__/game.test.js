const Game = require('common/js/game');
const Board = require('common/js/board');
const { Piece } = require ('common/js/piece');
const { 
  PIECE_TYPES,
  ROTATE_LEFT,
  ROTATE_RIGHT,
} = require('common/helpers/constants');
const { 
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
} = require('common/mockData/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1, p2, p3;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    game = new Game(1, pubSubTest, Board);
    game.board.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.J);
    p3 = new Piece(PIECE_TYPES.T);
  })

  afterEach(() => {
    jest.clearAllMocks();
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

  test('score points by moving piece down', () => {
    game.start();
    game.board.piece = p1;
    
    game.board.movePiece(0,10);

    // expected score is 10
    expect(game.score).toBe(10)

    game.board.movePiece(0,5);
    
    expect(game.score).toBe(15)
  });

  test('score points for single line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;

    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
    
    // I piece will hard drop 18. 36 + 100    
    expect(game.score).toBe(136)
  });
  
  test('score points for double line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    expect(game.score).toBe(0);

    game.board.rotatePiece(ROTATE_RIGHT);
    game.board.movePiece(3,0);
    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.score).toBe(332);
  });
  
  test('score points for triple line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p1;

    expect(game.score).toBe(0);

    game.board.rotatePiece(ROTATE_LEFT);
    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // I piece will hard drop 16. 32 + 500
    expect(game.score).toBe(532);
  });
  
  test('score points for tetris', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p3;
    game.board.nextPiece = p1;
    
    expect(game.score).toBe(0);

    game.board.rotatePiece(ROTATE_LEFT);
    game.board.rotatePiece(ROTATE_LEFT);
    game.board.movePiece(-2,0);
    game.board.hardDrop();

    game.board.rotatePiece(ROTATE_LEFT);
    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

    // T will hard drop 14, I will hard drop 16
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(860);
  });

  test('score points with level modifier', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;
    game.level = 2;
    
    expect(game.score).toBe(0);

    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);
    
    // I piece will hard drop 18. 36 + 200
    expect(game.score).toBe(236);
  });

  test('clearing lines updates lines cleared', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    game.board.rotatePiece(ROTATE_RIGHT);
    game.board.movePiece(3,0);
    game.board.hardDrop();

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.lines).toBe(2)
  });

  test('clearing lines updates level', () => {
    game.start();
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

  // test('game over', () => {
  //   game.start();
  //   game.board.grid = getTestBoard('empty');
  //   game.board.piece = new Piece(PIECE_TYPES.I);
  //   const gameOverSpy = jest.spyOn(game, 'unsubscribe');
  //   const boardMoveSpy = jest.spyOn(game.board, 'movePiece')

  //   // stacking I pieces on top of each other until they reach the top
  //   for(let i = 0; i < 5; i++) {
  //     game.board.nextPiece = new Piece(PIECE_TYPES.I);
  //     game.command('ROTATE_LEFT');
  //     game.command('HARD_DROP');
  //   }

  //   expect(boardMoveSpy).toHaveBeenCalledTimes(5);
  //   expect(gameOverSpy).toHaveBeenCalled();

  //   game.command('LEFT');
  //   // should not get called again
  //   expect(boardMoveSpy).toHaveBeenCalledTimes(5);
  // });

  // test('command queue - executes commands', () => {
  //   game.start();
  //   // duplicate scoring points for tetris
  //   game.board.grid = getTestBoard('clearLines2');
  //   game.board.piece = p3;
  //   game.board.nextPiece = p1;
    
  //   expect(game.score).toBe(0);

  //   const COMMANDS = [
  //     'ROTATE_LEFT',
  //     'ROTATE_LEFT',
  //     'AUTO_DOWN',
  //     'LEFT',
  //     'LEFT',
  //     'HARD_DROP',
  //     'ROTATE_LEFT',
  //     'AUTO_DOWN',
  //     'HARD_DROP',
  //   ]

  //   game.executeCommandQueue(COMMANDS);

  //   expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

  //   // T will hard drop 13, I will hard drop 15
  //   // there are two auto_downs which count for 0 points
  //   // 28 + 32 + 800 for tetris
  //   expect(game.score).toBe(856);
  // });

  // test('command queue - board updates get published', () => {
  //   game.start();
  //   const publishSpy = jest.spyOn(game.board, 'publishBoardUpdate');

  //   // duplicate scoring points for tetris
  //   game.board.grid = getTestBoard('clearLines2');
  //   game.board.piece = p3;
  //   game.board.nextPiece = p1;
    
  //   expect(game.score).toBe(0);

  //   const COMMANDS1 = [
  //     'ROTATE_LEFT',
  //     'ROTATE_LEFT',
  //     'AUTO_DOWN',
  //     'LEFT',
  //     'LEFT',
  //     'HARD_DROP',
  //   ]
    
  //   game.executeCommandQueue(COMMANDS1);

  //   // 1 publish to updateBoard for adding piece to board
  //   expect(publishSpy).toHaveBeenCalledTimes(1);

  //   const COMMANDS2 = [
  //     'ROTATE_LEFT',
  //     'AUTO_DOWN',
  //     'HARD_DROP',
  //   ]

  //   game.executeCommandQueue(COMMANDS2)

  //   // 1 publish for adding piece to board
  //   // 1 publish for clearing lines
  //   expect(publishSpy).toHaveBeenCalledTimes(3);

  // })
  });