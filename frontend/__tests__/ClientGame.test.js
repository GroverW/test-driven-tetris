const ClientGame = require('frontend/static/js/ClientGame');
const { Piece } = require('common/js/Piece');
const {
  PIECE_TYPES,
  CONTROLS,
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('frontend/helpers/clientConstants');
const {
  DRAW,
  UPDATE_SCORE,
  GAME_OVER,
  SEND_MESSAGE,
} = require('frontend/helpers/clientTopics');
const {
  TEST_BOARDS,
  getTestBoard,
  getTestPieces,
  mockAnimation,
} = require('frontend/mockData/mocks');
const { pubSubMock } = require('common/mockData/mocks');

const getNewTestGame = (game, testPiece = false, ...players) => {
  if(game) game.unsubscribe();
  game = new ClientGame(1);
  
  game.board.grid = getTestBoard('empty')
  
  if(testPiece) game.board.piece = new Piece(PIECE_TYPES.I);
  
  game.addPieces(getTestPieces());
  players.forEach(player => game.addPlayer(player));

  return game;
}

describe('game tests', () => {
  let game;
  let pubSubSpy;
  let p2 = 2, p3 = 3, p4 = 4;

  beforeAll(() => {
    game = getNewTestGame(game);
  });

  afterAll(() => {
    game.unsubscribe();
  })

  beforeEach(() => {
    pubSubSpy = pubSubMock();
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  })

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribeAll();
  });

  describe('basic tests', () => {
    test('add player', () => {
      game.addPlayer(p2);
      expect(game.players.length).toBe(1);
      
      // can't re-add same player
      game.addPlayer(p2);
      expect(game.players.length).toBe(1);
      
      game.addPlayer(p3);
      expect(game.players.length).toBe(2);
      
      game.addPlayer(p4);
      expect(game.players.length).toBe(3);
  
      expect(game.players).toEqual([p2,p3,p4]);
    });
  
    test('remove player', () => {
      expect(game.players.length).toBe(3);
  
      game.removePlayer(p3);
  
      expect(game.players.length).toBe(2);
      expect(game.players).toEqual([p2,p4])
    });
  
    test('start game', () => {
      const drawSpy = pubSubSpy.add(DRAW);
      const updateScoreSpy = pubSubSpy.add(UPDATE_SCORE);
      expect([game.score, game.level, game.lines]).toEqual([0, 1, 0]);
      expect(game.board.grid).toEqual(TEST_BOARDS.empty);
  
      expect(game.board.piece).not.toEqual(expect.any(Piece));
      expect(game.board.nextPiece).not.toEqual(expect.any(Piece));
  
      expect(drawSpy).not.toHaveBeenCalled();
      expect(updateScoreSpy).not.toHaveBeenCalled();
  
      game.start();
  
      expect(game.board.piece).toEqual(expect.any(Piece));
      expect(game.board.nextPiece).toEqual(expect.any(Piece));
  
      expect(drawSpy).toHaveBeenCalledTimes(1);
      expect(updateScoreSpy).toHaveBeenCalledTimes(1);
      expect(drawSpy).toHaveBeenCalledTimes(1);
    });
  
    test('add player - game started', () => {
      expect(game.gameStatus).toBe(true);
      expect(game.players.length).toBe(2);
      
      game.addPlayer(p3);
      
      expect(game.players.length).toBe(2);
    });
  
    test('keyboard controls', () => {
      let testPiece = new Piece(PIECE_TYPES.I);
      game.board.piece = testPiece;
  
      expect([testPiece.x, testPiece.y]).toEqual([3, 0]);
  
      game.command(CONTROLS.DOWN);
  
      expect([testPiece.x, testPiece.y]).toEqual([3, 1]);
  
      game.command(CONTROLS.LEFT);
  
      expect([testPiece.x, testPiece.y]).toEqual([2, 1]);
  
      game.command(CONTROLS.RIGHT);
  
      expect([testPiece.x, testPiece.y]).toEqual([3, 1]);
  
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
    });
  
    test('game over', () => {
      game = getNewTestGame(game, true);
      game.start();
      const gameOverSpy = pubSubSpy.add(GAME_OVER);
      const boardMoveSpy = jest.spyOn(game.board, 'movePiece');
  
      for (let i = 0; i < 15; i++) {
        game.board.nextPiece = new Piece(PIECE_TYPES.O);
        game.command(CONTROLS.HARD_DROP);
      }
      
      // only 10 O pieces can fit on the board
      expect(boardMoveSpy).toHaveBeenCalledTimes(10);
      expect(gameOverSpy).toHaveBeenCalled();
  
      game.command(CONTROLS.LEFT);
      // should not get called again
      expect(boardMoveSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe('command queue', () => {
    test('add commands', () => {
      game = getNewTestGame(game, true, p2, p4);
      game.start();
  
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
  
    test('send commands', () => {
      const sendMessageSpy = pubSubSpy.add(SEND_MESSAGE);
  
      expect(game.commandQueue.length).toBe(6);
  
      game.command(CONTROLS.HARD_DROP);
  
      // updating board should send commands and clear queue
      expect(game.commandQueue.length).toBe(0);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
  

      game.command(CONTROLS.ROTATE_RIGHT);
      game.command(CONTROLS.AUTO_DOWN);
      game.command(CONTROLS.LEFT);
      game.command(CONTROLS.HARD_DROP);

      expect(game.commandQueue.length).toBe(0);
      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('power ups', () => {
    test('adds to command queue', () => {
      game.sendCommandQueue = jest.fn().mockImplementation(() => {});
  
      game.command(CONTROLS.PLAYER3);
  
      // command queue should contain actual player id, whereas CONTROLS.PLAYER3
      // represents the player's board position relative to the one using the command
      expect(game.commandQueue).toEqual(["PLAYER4"])
    });
  
    test('sends command queue', () => {
      game.sendCommandQueue = jest.fn();
      
      game.command(CONTROLS.PLAYER2);
  
      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);
  
      game.command(CONTROLS.PLAYER4);
      // should not send if player not found
      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe('animate', () => {
    test('animates on start', () => {
      game = getNewTestGame(game, true);
      const animateSpy = jest.spyOn(game, 'animate');
  
      expect(game.animationId).toBe(undefined);
  
      game.start();
  
      expect(game.animationId).toEqual(expect.any(Number));
      expect(animateSpy).toHaveBeenCalledTimes(1);
    });
  
    test('moves piece at set intervals', () => {
      requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
      const movePieceSpy = jest.spyOn(game.board, 'movePiece');
      const autoDropSpy = jest.spyOn(game, 'handleAutoDrop');

      jest.advanceTimersByTime(1000);
  
      expect(autoDropSpy).toHaveBeenCalledTimes(10);
      expect(movePieceSpy).toHaveBeenCalledTimes(3);
    });
  
    test('moves piece with toggled key', () => {
      // have to restart game because timers carry over from previous test
      game = getNewTestGame(game, true);
      game.start();
      const movePieceSpy = jest.spyOn(game.board, 'movePiece');
      const toggledMoveSpy = jest.spyOn(game, 'handleToggledMovement');

      game.toggleMove(CONTROLS.DOWN, 'down');
  
      expect(movePieceSpy).toHaveBeenCalledTimes(0);
  
      jest.advanceTimersByTime(200);
  
      expect(toggledMoveSpy).toHaveBeenCalledTimes(2);
      expect(movePieceSpy).toHaveBeenCalledTimes(2);
    });
  
    test('animation speed', () => {
      expect(game.level).toBe(1);
  
      expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[game.level]);
  
      game.level = 10;
      expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[10]);
  
      game.level = 100;
      expect(game.getAnimationDelay()).toBe(ANIMATION_SPEED[MAX_SPEED]);
    });
  
    test('clears animation on game over', () => {
      const cancelAnimationSpy = jest.spyOn(window, 'cancelAnimationFrame');
  
      game.gameOver({ id: 1 });
  
      expect(cancelAnimationSpy).toHaveBeenCalledTimes(1);
      expect(game.animationId).toBe(undefined);
    });
  });
});