const ServerGame = require('../js/serverGame');
const { Piece } = require ('../../common/js/piece');
const { PIECE_TYPES } = require('../helpers/serverConstants');
const { 
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
} = require('../../common/__tests__/helpers/mocks');
const pubSub = require('../helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1, p2, p3;
  let pubSubTest;

  beforeEach(() => {
    pubSubTest = pubSub();
    game = new ServerGame(pubSubTest, 1);
    game.board.pieceList.pieces.push(getTestPieces());
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.J);
    p3 = new Piece(PIECE_TYPES.T);
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('game over', () => {
    game.start();
    game.board.grid = getTestBoard('empty');
    game.board.piece = new Piece(PIECE_TYPES.I);
    const gameOverSpy = jest.spyOn(game, 'unsubscribe');
    const boardMoveSpy = jest.spyOn(game.board, 'movePiece')

    // stacking I pieces on top of each other until they reach the top
    for(let i = 0; i < 5; i++) {
      game.board.nextPiece = new Piece(PIECE_TYPES.I);
      game.command('ROTATE_LEFT');
      game.command('HARD_DROP');
    }

    expect(boardMoveSpy).toHaveBeenCalledTimes(5);
    expect(gameOverSpy).toHaveBeenCalled();

    game.command('LEFT');
    // should not get called again
    expect(boardMoveSpy).toHaveBeenCalledTimes(5);
  });

  test('command queue - executes commands', () => {
    game.start();
    // duplicate scoring points for tetris
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p3;
    game.board.nextPiece = p1;
    
    expect(game.score).toBe(0);

    const COMMANDS = [
      'ROTATE_LEFT',
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'LEFT',
      'LEFT',
      'HARD_DROP',
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'HARD_DROP',
    ]

    game.executeCommandQueue(COMMANDS);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

    // T will hard drop 13, I will hard drop 15
    // there are two auto_downs which count for 0 points
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(856);
  });

  test('command queue - board updates get published', () => {
    game.start();
    const publishSpy = jest.spyOn(game.board, 'publishBoardUpdate');

    // duplicate scoring points for tetris
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p3;
    game.board.nextPiece = p1;
    
    expect(game.score).toBe(0);

    const COMMANDS1 = [
      'ROTATE_LEFT',
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'LEFT',
      'LEFT',
      'HARD_DROP',
    ]
    
    game.executeCommandQueue(COMMANDS1);

    // 1 publish to updateBoard for adding piece to board
    expect(publishSpy).toHaveBeenCalledTimes(1);

    const COMMANDS2 = [
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'HARD_DROP',
    ]

    game.executeCommandQueue(COMMANDS2)

    // 1 publish for adding piece to board
    // 1 publish for clearing lines
    expect(publishSpy).toHaveBeenCalledTimes(3);

  })
  });