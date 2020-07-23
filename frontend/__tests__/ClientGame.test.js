const gameLoop = require('frontend/static/js/GameLoop');
const Piece = require('common/js/Piece');
const { PIECE_TYPES, CONTROLS } = require('frontend/helpers/clientConstants');
const {
  DRAW,
  UPDATE_SCORE,
  START_GAME,
  GAME_OVER,
  ADD_PLAYER,
  SEND_MESSAGE,
  SET_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');
const {
  mockAnimation,
  getNewTestGame,
  runCommand,
} = require('frontend/mockData/mocks');
const { pubSubMock } = require('common/mockData/mocks');
const { publish } = require('frontend/helpers/pubSub');

describe('client game tests', () => {
  let game;
  let pubSubSpy;
  const p2 = 2; const p3 = 3; const
    p4 = 4;

  beforeEach(() => {
    game = getNewTestGame(game);
    // setting id to 2 so that it never receives GAME_OVER
    gameLoop.initialize(2);
    pubSubSpy = pubSubMock();
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribeAll();
    game.unsubscribe();
    gameLoop.unsubscribe();
  });

  describe('basic tests', () => {
    describe('add / remove player', () => {
      test('adds players', () => {
        game.addPlayer(p2);
        expect(game.players.length).toBe(1);

        // can't re-add same player
        game.addPlayer(p2);
        expect(game.players.length).toBe(1);

        game.addPlayer(p3);
        expect(game.players.length).toBe(2);

        game.addPlayer(p4);
        expect(game.players.length).toBe(3);

        expect(game.players).toEqual([p2, p3, p4]);
      });

      test('removes player', () => {
        game.addPlayer(p2);
        game.addPlayer(p3);
        game.addPlayer(p4);
        expect(game.players.length).toBe(3);

        game.removePlayer(p3);

        expect(game.players.length).toBe(2);
        expect(game.players).toEqual([p2, p4]);
      });
    });

    describe('start game / game over', () => {
      beforeEach(() => {
        game.addPlayer(p2);
        game.addPlayer(p4);
      });

      test('starts game', () => {
        const drawSpy = pubSubSpy.add(DRAW);
        const updateScoreSpy = pubSubSpy.add(UPDATE_SCORE);

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

      test('does not add player if game started', () => {
        game[START_GAME]();
        expect(game.gameStatus).toBe(true);
        expect(game.players.length).toBe(2);

        game.addPlayer(p3);

        expect(game.players.length).toBe(2);
      });

      test('does not run commands after game over', () => {
        game[START_GAME]();
        game.board.piece = new Piece(PIECE_TYPES.O);
        const gameOverSpy = pubSubSpy.add(GAME_OVER);
        const boardMoveSpy = jest.spyOn(game.board, 'movePiece');

        for (let i = 0; i < 15; i += 1) {
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

    describe('keyboard controls', () => {
      test('publishes commands on keyboard controls', () => {
        game[START_GAME]();
        const setCommandSpy = pubSubSpy.add(SET_COMMAND);
        const clearCommandSpy = pubSubSpy.add(CLEAR_COMMAND);

        game.command(CONTROLS.DOWN, 'down');

        expect(setCommandSpy).toHaveBeenCalledTimes(1);
        expect(clearCommandSpy).toHaveBeenCalledTimes(0);

        game.command(CONTROLS.DOWN, 'up');

        expect(setCommandSpy).toHaveBeenCalledTimes(1);
        expect(clearCommandSpy).toHaveBeenCalledTimes(1);
      });

      test('does not run commands for invalid keys', () => {
        game[START_GAME]();
        const setCommandSpy = pubSubSpy.add(SET_COMMAND);
        const clearCommandSpy = pubSubSpy.add(CLEAR_COMMAND);

        game.command(CONTROLS.DOWN, 'down');
        game.command(CONTROLS.DOWN, 'down');

        expect(setCommandSpy).toHaveBeenCalledTimes(2);
        expect(clearCommandSpy).toHaveBeenCalledTimes(0);

        game.command(null, 'down');

        expect(setCommandSpy).toHaveBeenCalledTimes(2);
        expect(clearCommandSpy).toHaveBeenCalledTimes(0);

        game.command(CONTROLS.DOWN, 'up');

        expect(setCommandSpy).toHaveBeenCalledTimes(2);
        expect(clearCommandSpy).toHaveBeenCalledTimes(1);

        game.command(null, 'up');

        expect(setCommandSpy).toHaveBeenCalledTimes(2);
        expect(clearCommandSpy).toHaveBeenCalledTimes(1);
      });

      test('sends command queue if game status is falsey', () => {
        const sendQueueSpy = jest.spyOn(game, 'sendCommandQueue');

        game.command(CONTROLS.DOWN, 'down');

        expect(sendQueueSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('command queue', () => {
    beforeEach(() => {
      game[START_GAME]();
    });

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
        'LEFT', 'RIGHT', 'DOWN', 'ROTATE_LEFT', 'ROTATE_RIGHT',
      ]);
    });

    test('send commands', () => {
      const sendMessageSpy = pubSubSpy.add(SEND_MESSAGE);

      expect(game.commandQueue.length).toBe(0);

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

  describe('board / piece validations', () => {
    beforeEach(() => {
      game[START_GAME]();
    });

    test('validates whether piece can move down', () => {
      expect(game.isValidDrop()).toBe(true);

      while (game.board.validMove(0, 1)) {
        game.board.movePiece(0, 1, 0);
      }

      expect(game.isValidDrop()).toBe(false);
    });

    test('validates whether piece has reached lowest point', () => {
      game.board.movePiece(0, 1, 0);

      expect(game.isPieceAtLowestPoint()).toBe(true);

      game.board.movePiece(0, -1, 0);

      expect(game.isPieceAtLowestPoint()).toBe(false);
    });
  });

  describe('power ups', () => {
    beforeEach(() => {
      game.addPlayer(p2);
      game.addPlayer(p4);
      game[START_GAME]();
    });

    test('adds to command queue', () => {
      game.sendCommandQueue = jest.fn().mockImplementation(() => { });

      runCommand(game, CONTROLS.PLAYER3);

      // command queue should contain actual player id, whereas CONTROLS.PLAYER3
      // represents the player's board position relative to the one using the command
      expect(game.commandQueue).toEqual(['PLAYER4']);
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

  describe('publish / subscribe', () => {
    describe('START_GAME / GAME_OVER', () => {
      test('START_GAME should start game', () => {
        const drawSpy = pubSubSpy.add(DRAW);
        const updateScoreSpy = pubSubSpy.add(UPDATE_SCORE);

        expect(game.board.piece).not.toEqual(expect.any(Piece));
        expect(game.board.nextPiece).not.toEqual(expect.any(Piece));

        expect(drawSpy).not.toHaveBeenCalled();
        expect(updateScoreSpy).not.toHaveBeenCalled();

        publish(START_GAME);

        expect(game.board.piece).toEqual(expect.any(Piece));
        expect(game.board.nextPiece).toEqual(expect.any(Piece));

        expect(drawSpy).toHaveBeenCalledTimes(1);
        expect(updateScoreSpy).toHaveBeenCalledTimes(1);
        expect(drawSpy).toHaveBeenCalledTimes(1);
      });

      test('GAME_OVER should set game status to null', () => {
        game[START_GAME]();

        expect(game.gameStatus).toBe(true);

        publish(GAME_OVER, { id: 1 });

        expect(game.gameStatus).toBe(null);
      });

      test('GAME_OVER should not set game status if player id does not match', () => {
        game[START_GAME]();

        expect(game.gameStatus).toBe(true);

        publish(GAME_OVER, { id: 2 });

        expect(game.gameStatus).toBe(true);
      });
    });

    describe('ADD_PLAYER', () => {
      test('should add player and call mapPlayerTargets', () => {
        const mapTargetsSpy = jest.spyOn(game, 'mapPlayerTargets');

        expect(game.players.length).toBe(0);
        expect(mapTargetsSpy).toHaveBeenCalledTimes(0);

        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(1);
        expect(mapTargetsSpy).toHaveBeenCalledTimes(1);
      });

      test('should not add player if game started', () => {
        game[START_GAME]();

        expect(game.players.length).toBe(0);

        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(0);
      });

      test('should not add player if player already added', () => {
        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(1);

        publish(ADD_PLAYER, p3);

        expect(game.players.length).toBe(2);

        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(2);
      });
    });

    describe('REMOVE_PLAYER', () => {
      test('should remove player and call mapPlayerTargets', () => {

      });

      test('should not remove player if no id match', () => {

      });
    });

    describe('UPDATE_PLAYER', () => {
      test('should replace board if player id matches', () => {

      });

      test('should not replace board if player id does not match', () => {

      });
    });

    test('BOARD_CHANGE should send command queue', () => {

    });

    test('LOWER_PIECE should publish score update', () => {

    });
  });
});
