const Game = require('../static/js/game');
const { Piece } = require('../static/js/piece');
const {
  PIECES,
  CONTROLS,
  ANIMATION_SPEED,
  MAX_SPEED
} = require('../helpers/data');
const {
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
  mockAnimation,
  pubSubMocks
} = require('../helpers/mocks');
const { publish } = require('../helpers/pubSub');

describe('game tests', () => {
  let game;
  let p1, p2, p3;
  let pubSub;

  beforeEach(() => {
    pubSub = pubSubMocks();
    game = new Game(1);
    p1 = new Piece(PIECES[0]);
    p2 = new Piece(PIECES[6]);
    p3 = new Piece(PIECES[2]);
    
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
    // should not overwrite current key with additional key
    expect(game.toggledKey).toBe(CONTROLS.DOWN);

    game.toggleMove(CONTROLS.LEFT, 'up');
    expect(game.toggledKey).toBe(CONTROLS.DOWN);

    game.toggleMove(CONTROLS.DOWN, 'up');
    expect(game.toggledKey).toBe(false);

    const commandSpy = jest.spyOn(game, 'command');
    game.toggleMove(CONTROLS.HARD_DROP, 'down');
    expect(commandSpy).toHaveBeenCalledTimes(1);

    game.toggleMove(CONTROLS.HARD_DROP, 'up');
    expect(commandSpy).toHaveBeenCalledTimes(1);
  })

  test('score points by moving piece down', () => {
    game.start();
    game.board.piece = p1;

    game.command(CONTROLS.HARD_DROP);

    // expected score is 36
    expect(game.score).toBe(36)
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(2);

    game.command(CONTROLS.DOWN);

    expect(game.score).toBe(37)
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(3);
  });

  test('score points for single line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;

    game.command(CONTROLS.HARD_DROP)

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);

    // I piece will hard drop 18. 36 + 100    
    expect(game.score).toBe(136)
    // 1 for game start, 1 for moving piece down, 1 for clearing lines, 1 for updating lines
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(4);
  });

  test('score points for double line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    expect(game.score).toBe(0);

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.score).toBe(332);
    // 1 for game start, 1 for moving piece down, 1 for clearing lines, 1 for updating lines
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(4);
  });

  test('score points for triple line', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p1;

    expect(game.score).toBe(0);

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared3);

    // I piece will hard drop 16. 32 + 500
    expect(game.score).toBe(532);
    // 1 for game start, 1 for moving piece down, 1 for clearing lines, 1 for updating lines
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(4);
  });

  test('score points for tetris', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = p3;
    game.board.nextPiece = p1;

    expect(game.score).toBe(0);

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.HARD_DROP);

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines2Cleared4);

    // T will hard drop 14, I will hard drop 16
    // 28 + 32 + 800 for tetris
    expect(game.score).toBe(860);
    // 1 for game start, 2 for moving piece down, 1 for clearing lines, 1 for updating lines
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(5);
  });

  test('score points with level modifier', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines1');
    game.board.piece = p1;
    game.level = 2;

    expect(game.score).toBe(0);

    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines1Cleared);

    // I piece will hard drop 18. 36 + 200
    expect(game.score).toBe(236);
    // 1 for game start, 1 for moving piece down, 1 for clearing lines, 1 for updating lines
    expect(pubSub.updateScoreMock).toHaveBeenCalledTimes(4);
  })

  test('clearing lines updates lines cleared', () => {
    game.start();
    game.board.grid = getTestBoard('clearLines3');
    game.board.piece = p2;

    game.command(CONTROLS.ROTATE_LEFT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.RIGHT);
    game.command(CONTROLS.HARD_DROP);

    expect(game.board.grid).toEqual(TEST_BOARDS.clearLines3Cleared);

    // J piece will hard drop 16. 32 + 300
    expect(game.lines).toBe(2);
  });

  test('clearing lines updates level', () => {
    expect(game.level).toBe(1);

    publish('clearLines', 4);

    expect(game.linesRemaining).toBe(6);

    publish('clearLines', 4);
    publish('clearLines', 4);

    expect(game.level).toBe(2);
    expect(game.linesRemaining).toBe(8);

    publish('clearLines', 4);
    publish('clearLines', 4);

    expect(game.level).toBe(3);
  });

  test('game over', () => {
    game.start();
    
    game.board.grid = getTestBoard('empty');
    game.board.piece = new Piece(PIECES[0]);
    const boardMoveSpy = jest.spyOn(game.board, 'movePiece');

    for (let i = 0; i < 5; i++) {
      game.board.nextPiece = new Piece(PIECES[0]);
      game.command(CONTROLS.ROTATE_LEFT);
      game.command(CONTROLS.HARD_DROP);
    }
    
    expect(boardMoveSpy).toHaveBeenCalledTimes(5);
    expect(pubSub.gameOverMock).toHaveBeenCalled();

    game.command(CONTROLS.LEFT);
    // should not get called again
    expect(boardMoveSpy).toHaveBeenCalledTimes(5);

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