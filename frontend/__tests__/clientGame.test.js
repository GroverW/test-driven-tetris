const ClientGame = require('../static/js/clientGame');
const { Piece } = require('../../common/js/piece');
const {
  PIECE_TYPES,
  CONTROLS,
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('../helpers/clientConstants');
const {
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
  mockAnimation,
  pubSubMocks,
} = require('../helpers/mocks');

describe('game tests', () => {
  let game;
  let p1;
  let pubSub;

  beforeEach(() => {
    pubSub = pubSubMocks();
    game = new ClientGame(1);
    p1 = new Piece(PIECE_TYPES.I);
    p2 = new Piece(PIECE_TYPES.J);
    p3 = new Piece(PIECE_TYPES.T);
    
    jest.useFakeTimers();
    
    game.board.pieceList.addSet(getTestPieces());
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    game.unsubscribe()
    pubSub.clearMockSubscriptions();
  });

  test('start game', () => {
    expect([game.score, game.level, game.lines]).toEqual([0, 1, 0]);
    expect(game.board.grid).toEqual(TEST_BOARDS.empty);

    expect(game.board.piece).not.toEqual(expect.any(Piece));
    expect(game.board.nextPiece).not.toEqual(expect.any(Piece));

    expect(pubSub.drawMock).not.toHaveBeenCalled();
    expect(pubSub.updateScoreMock).not.toHaveBeenCalled();

    game.start();

    expect(game.board.piece).toEqual(expect.any(Piece));
    expect(game.board.nextPiece).toEqual(expect.any(Piece));

    expect(pubSub.drawMock).toHaveBeenCalledTimes(1);
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(1);
    expect(pubSub.drawMock).toHaveBeenCalledTimes(1);
  });

  test('keyboard controls', () => {
    game.start();
    game.board.piece = p1;

    expect([p1.x, p1.y]).toEqual([3, 0]);

    game.command(CONTROLS.DOWN);

    expect([p1.x, p1.y]).toEqual([3, 1]);

    game.command(CONTROLS.LEFT);

    expect([p1.x, p1.y]).toEqual([2, 1]);

    game.command(CONTROLS.RIGHT);

    expect([p1.x, p1.y]).toEqual([3, 1]);

    expect(game.board.piece.grid).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])

    game.command(CONTROLS.ROTATE_LEFT);

    expect(game.board.piece.grid).toEqual([
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ])

    game.command(CONTROLS.ROTATE_RIGHT);

    expect(game.board.piece.grid).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])

    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.pattern1);
  });

  test('toggle vs keypress movement', () => {
    const commandSpy = jest.spyOn(game, 'command');

    // should only toggle with basic movement
    game.toggleMove(CONTROLS.HARD_DROP, 'down');

    expect(game.toggledKey).toBe(false);
    expect(commandSpy).toHaveBeenCalledTimes(1);

    game.toggleMove(CONTROLS.DOWN, 'down');

    expect(game.toggledKey).toBe(CONTROLS.DOWN);
    expect(commandSpy).toHaveBeenCalledTimes(1);
  });

  test('toggle on keydown vs up', () => {
    game.toggleMove(CONTROLS.DOWN, 'down');
    expect(game.toggledKey).toBe(CONTROLS.DOWN);

    game.toggleMove(CONTROLS.LEFT, 'down');
    
    // should overwrite current key with additional key
    expect(game.toggledKey).toBe(CONTROLS.LEFT);

    // should not release toggle if non-toggled key released
    game.toggleMove(CONTROLS.DOWN, 'up');
    expect(game.toggledKey).toBe(CONTROLS.LEFT);

    game.toggleMove(CONTROLS.LEFT, 'up');
    expect(game.toggledKey).toBe(false);

    const commandSpy = jest.spyOn(game, 'command');
    game.toggleMove(CONTROLS.HARD_DROP, 'down');
    expect(commandSpy).toHaveBeenCalledTimes(1);

    game.toggleMove(CONTROLS.HARD_DROP, 'up');
    expect(commandSpy).toHaveBeenCalledTimes(1);
  })

  test('game over', () => {
    game.start();
    
    game.board.grid = getTestBoard('empty');
    game.board.piece = new Piece(PIECE_TYPES.I);
    const boardMoveSpy = jest.spyOn(game.board, 'movePiece');

    for (let i = 0; i < 15; i++) {
      game.board.nextPiece = new Piece(PIECE_TYPES.O);
      game.command(CONTROLS.HARD_DROP);
    }
    
    // only 10 O pieces can fit on the board
    expect(boardMoveSpy).toHaveBeenCalledTimes(10);
    expect(pubSub.gameOverMock).toHaveBeenCalled();

    game.command(CONTROLS.LEFT);
    // should not get called again
    expect(boardMoveSpy).toHaveBeenCalledTimes(10);

  })

  test('animate - animates on start', () => {
    const animateSpy = jest.spyOn(game, 'animate');

    expect(game.animationId).toBe(undefined);

    game.start();

    expect(game.animationId).toEqual(expect.any(Number));
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  test('animate - clears animation on gameOver', () => {
    const cancelAnimationSpy = jest.spyOn(window, 'cancelAnimationFrame');

    expect(game.animationId).toBe(undefined);

    game.start();

    expect(game.animationId).toEqual(expect.any(Number));

    game.gameOver({ id: 1 });

    expect(cancelAnimationSpy).toHaveBeenCalledTimes(1);
    expect(game.animationId).toBe(undefined);
  });

  test('animate - moves piece at set intervals', () => {
    const movePieceSpy = jest.spyOn(game.board, 'movePiece');

    game.start();

    jest.advanceTimersByTime(1000);

    expect(requestAnimationFrame).toHaveBeenCalledTimes(11);
    expect(movePieceSpy).toHaveBeenCalledTimes(1);
  });

  test('animate - moves piece with toggled key', () => {
    const movePieceSpy = jest.spyOn(game.board, 'movePiece');

    game.toggleMove(CONTROLS.DOWN, 'down');

    game.start();

    expect(movePieceSpy).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(200);

    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
    expect(movePieceSpy).toHaveBeenCalledTimes(2);
  });

  test('animation speed', () => {
    game.start();

    expect(game.level).toBe(1);

    expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[game.level]);

    game.level = 10;
    expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[10]);

    game.level = 100;
    expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[MAX_SPEED]);
  });

  test('command queue - add commands', () => {
    game.start();
    game.command(CONTROLS.DOWN);

    expect(game.commandQueue).toEqual(['DOWN']);

    game.commandQueue = [];

    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.DOWN);
    game.command(CONTROLS.AUTO_DOWN);
    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.ROTATE_RIGHT);

    expect(game.commandQueue).toEqual([
      "LEFT", "RIGHT", "DOWN", "AUTO_DOWN", "ROTATE_LEFT", "ROTATE_RIGHT"
    ]);
  });

  test('command queue - send commands', () => {
    game.start();
    
    game.command(CONTROLS.DOWN);
    game.command(CONTROLS.ROTATE_RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.AUTO_DOWN);

    expect(game.commandQueue.length).toBe(4);

    game.command(CONTROLS.HARD_DROP);

    // updating board should send commands and clear queue
    expect(game.commandQueue.length).toBe(0);
    expect(pubSub.executeCommandsMock).toHaveBeenCalledTimes(1);

    game.command(CONTROLS.ROTATE_RIGHT);
    game.command(CONTROLS.AUTO_DOWN);
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.HARD_DROP);

    expect(game.commandQueue.length).toBe(0);
    expect(pubSub.executeCommandsMock).toHaveBeenCalledTimes(2);
  })
});