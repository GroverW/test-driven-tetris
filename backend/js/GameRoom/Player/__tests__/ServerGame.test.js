const ServerGame = require('backend/js/GameRoom/Player/ServerGame');
const { GAME_TYPES, POWER_UP_TYPES, MAX_POWER_UPS } = require('backend/constants');
const {
  UPDATE_PLAYER, CLEAR_LINES, ADD_POWER_UP, USE_POWER_UP,
} = require('backend/topics');
const {
  getTestBoard, getTestPiece, getTestPieces, pubSubMock,
} = require('common/mocks');
const pubSub = require('backend/helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1;
  let p2;
  let pubSubTest;
  let pubSubSpy;

  beforeEach(() => {
    pubSubTest = pubSub();
    pubSubSpy = pubSubMock(pubSubTest);
    game = new ServerGame(pubSubTest, 1, GAME_TYPES.MULTI);
    game.board.pieceList.pieces.push(getTestPieces());
    p1 = getTestPiece('I');
    p2 = getTestPiece('T');
  });

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribe();
  });

  test('game over', () => {
    game.start();
    game.board.grid = getTestBoard('empty');
    game.board.piece = getTestPiece('I');
    const gameOverSpy = jest.spyOn(game, 'unsubscribe');
    const boardMoveSpy = jest.spyOn(game.board, 'movePiece');

    // stacking I pieces on top of each other until they reach the top
    for (let i = 0; i < 5; i += 1) {
      game.board.nextPiece = getTestPiece('I');
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
    game.board.piece = p2;
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
    ];

    game.executeCommandQueue(COMMANDS);

    expect(game.board.grid).toEqual(getTestBoard('clearLines2Cleared4'));

    // T will hard drop 13, I will hard drop 15
    // there are two auto_downs which count for 0 points
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(856);
  });

  test('command queue - board updates get published', () => {
    const updatePlayerSpy = pubSubSpy.add(UPDATE_PLAYER);
    const clearLinesSpy = pubSubSpy.add(CLEAR_LINES);
    game.start();

    // duplicate scoring points for tetris
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p2;
    game.board.nextPiece = p1;

    expect(game.score).toBe(0);

    const COMMANDS1 = [
      'ROTATE_LEFT',
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'LEFT',
      'LEFT',
      'HARD_DROP',
    ];

    game.executeCommandQueue(COMMANDS1);

    expect(updatePlayerSpy).toHaveBeenCalledTimes(1);
    expect(clearLinesSpy).toHaveBeenCalledTimes(0);

    const COMMANDS2 = [
      'ROTATE_LEFT',
      'AUTO_DOWN',
      'HARD_DROP',
    ];

    game.executeCommandQueue(COMMANDS2);

    expect(updatePlayerSpy).toHaveBeenCalledTimes(2);
    expect(clearLinesSpy).toHaveBeenCalledTimes(1);
  });

  describe('power ups', () => {
    test('add power up', () => {
      game.addPowerUp(POWER_UP_TYPES.SCRAMBLE_BOARD);

      expect(game.powerUps.length).toBe(1);

      game.addPowerUp('NA');

      expect(game.powerUps.length).toBe(1);
    });

    test('add power up - max power ups', () => {
      game.addPowerUp(POWER_UP_TYPES.SCRAMBLE_BOARD);

      expect(game.powerUps.length).toBe(1);

      for (let i = 0; i < 20; i += 1) {
        game.addPowerUp(POWER_UP_TYPES.SCRAMBLE_BOARD);
      }

      expect(game.powerUps.length).toBe(Math.min(MAX_POWER_UPS, 21));
    });

    test('randomly add power ups from clearing lines', () => {
      Math.random = jest.fn().mockReturnValue(0);
      game.start();

      // duplicate scoring points for tetris
      game.board.grid = getTestBoard('clearLines2');
      game.board.piece = getTestPiece('T');
      game.board.nextPiece = getTestPiece('I');

      const COMMANDS1 = [
        'ROTATE_LEFT',
        'ROTATE_LEFT',
        'LEFT',
        'LEFT',
        'HARD_DROP',
        'ROTATE_LEFT',
        'HARD_DROP',
      ];

      game.executeCommandQueue(COMMANDS1);
      const addPowerUpSpy = pubSubSpy.add(ADD_POWER_UP);
      // should not be called because random power up selected is invalid
      expect(addPowerUpSpy).toHaveBeenCalledTimes(0);
      expect(game.powerUps.length).toBe(0);

      Math.random = jest.fn().mockReturnValue(0.9);

      game.board.grid = getTestBoard('clearLines2');
      game.board.piece = getTestPiece('T');
      game.board.nextPiece = getTestPiece('I');

      const COMMANDS2 = [
        'ROTATE_LEFT',
        'ROTATE_LEFT',
        'LEFT',
        'LEFT',
        'HARD_DROP',
        'ROTATE_LEFT',
        'HARD_DROP',
      ];

      game.executeCommandQueue(COMMANDS2);
      expect(addPowerUpSpy).toHaveBeenCalledTimes(1);
      expect(game.powerUps.length).toBe(1);
    });

    test('command queue - publish power ups', () => {
      const usePowerUpSpy = pubSubSpy.add(USE_POWER_UP);
      game.start();

      game.addPowerUp(POWER_UP_TYPES.SWAP_LINES);

      const COMMANDS = [
        'ROTATE_LEFT',
        'AUTO_DOWN',
        'PLAYER1',
      ];
      game.executeCommandQueue(COMMANDS);

      expect(usePowerUpSpy).toHaveBeenCalledTimes(1);
    });
  });
});
