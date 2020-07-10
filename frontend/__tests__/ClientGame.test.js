const GameLoop = require('frontend/static/js/GameLoop');
const { Piece } = require('common/js/Piece');
const { PIECE_TYPES, CONTROLS } = require('frontend/helpers/clientConstants');
const {
  DRAW,
  UPDATE_SCORE,
  START_GAME,
  GAME_OVER,
  SEND_MESSAGE,
  SET_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');
const {
  TEST_BOARDS,
  mockAnimation,
  getNewTestGame,
  runCommand,
} = require('frontend/mockData/mocks');
const { pubSubMock } = require('common/mockData/mocks');


describe('game tests', () => {
  let game;
  let gameLoop;
  let pubSubSpy;
  let p2 = 2, p3 = 3, p4 = 4;

  beforeAll(() => {
    game = getNewTestGame(game);
    // setting id to 2 so that it never receives GAME_OVER
    gameLoop = new GameLoop(2);
  });

  afterAll(() => {
    game.unsubscribe();
    gameLoop.unsubscribe();
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
  
      game[START_GAME]();
      gameLoop[START_GAME]();
  
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
      const setCommandSpy = pubSubSpy.add(SET_COMMAND);
      const clearCommandSpy = pubSubSpy.add(CLEAR_COMMAND);
  
      game.command(CONTROLS.DOWN, 'down');
  
      expect(setCommandSpy).toHaveBeenCalledTimes(1);
      expect(clearCommandSpy).toHaveBeenCalledTimes(0);
      
      game.command(CONTROLS.DOWN, 'up');
      
      expect(setCommandSpy).toHaveBeenCalledTimes(1);
      expect(clearCommandSpy).toHaveBeenCalledTimes(1);
    });
  
    test('game over', () => {
      game = getNewTestGame(game, true);
      game.start();
      game.board.piece = new Piece(PIECE_TYPES.O);
      const gameOverSpy = pubSubSpy.add(GAME_OVER);
      const boardMoveSpy = jest.spyOn(game.board, 'movePiece');
      
      
      for (let i = 0; i < 15; i++) {
        game.board.nextPiece = new Piece(PIECE_TYPES.O);
        runCommand(game, CONTROLS.HARD_DROP);
      }

      // only 10 O pieces can fit on the board
      expect(boardMoveSpy).toHaveBeenCalledTimes(10);
      expect(gameOverSpy).toHaveBeenCalled();
  
      runCommand(game, CONTROLS.LEFT);

      // should not get called again
      expect(boardMoveSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe('command queue', () => {
    test('add commands', () => {
      game = getNewTestGame(game, true, p2, p4);
      game.start();
      gameLoop.autoCommand = undefined;
  
      runCommand(game, CONTROLS.LEFT);
      runCommand(game, CONTROLS.RIGHT);
      runCommand(game, CONTROLS.DOWN);
      runCommand(game, CONTROLS.ROTATE_LEFT);
      runCommand(game, CONTROLS.ROTATE_RIGHT);
  
      expect(game.commandQueue).toEqual([
        "LEFT", "RIGHT", "DOWN", "ROTATE_LEFT", "ROTATE_RIGHT"
      ]);
    });
  
    test('send commands', () => {
      const sendMessageSpy = pubSubSpy.add(SEND_MESSAGE);
  
      expect(game.commandQueue.length).toBe(5);
  
      runCommand(game, CONTROLS.HARD_DROP);
  
      // updating board should send commands and clear queue
      expect(game.commandQueue.length).toBe(0);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
  
      runCommand(game, CONTROLS.ROTATE_RIGHT);
      runCommand(game, CONTROLS.AUTO_DOWN);
      runCommand(game, CONTROLS.LEFT);
      runCommand(game, CONTROLS.HARD_DROP);

      expect(game.commandQueue.length).toBe(0);
      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('power ups', () => {
    test('adds to command queue', () => {
      game.sendCommandQueue = jest.fn().mockImplementation(() => {});
  
      runCommand(game, CONTROLS.PLAYER3);
  
      // command queue should contain actual player id, whereas CONTROLS.PLAYER3
      // represents the player's board position relative to the one using the command
      expect(game.commandQueue).toEqual(["PLAYER4"])
    });
  
    test('sends command queue', () => {
      game.sendCommandQueue = jest.fn();
      
      runCommand(game, CONTROLS.PLAYER2);
  
      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);
  
      runCommand(game, CONTROLS.PLAYER4);
      // should not send if player not found
      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);
    });
  });
});