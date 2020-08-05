const gameLoop = require('frontend/static/js/GameLoop');
const Piece = require('common/js/Piece');
const { CONTROLS } = require('frontend/helpers/clientConstants');
const {
  DRAW,
  UPDATE_SCORE,
  START_GAME,
  GAME_OVER,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_PLAYER,
  BOARD_CHANGE,
  LOWER_PIECE,
  SEND_MESSAGE,
  SET_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');
const {
  mockAnimation,
  mockCancelAnimation,
  getNewTestGame,
  runCommands,
  clearMocksAndUnsubscribe,
} = require('frontend/mockData/mocks');
const { pubSubMock, getTestBoard, getTestPiece } = require('common/mockData/mocks');
const { publish } = require('frontend/helpers/pubSub');

describe('client game tests', () => {
  let game;
  let pubSubSpy;
  const p2 = 2; const p3 = 3; const p4 = 4;

  beforeEach(() => {
    game = getNewTestGame();
    // setting id to 2 so that it never receives GAME_OVER
    gameLoop.initialize(2);
    pubSubSpy = pubSubMock();
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
    cancelAnimationFrame = jest.fn().mockImplementation(mockCancelAnimation);
  });

  afterEach(() => {
    clearMocksAndUnsubscribe(pubSubSpy, game, gameLoop);
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

        expect(game.players).toEqual([p2, p3]);
      });

      test('removes player', () => {
        game.addPlayer(p2);
        game.addPlayer(p3);
        game.addPlayer(p4);

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
        game.board.piece = getTestPiece('O');
        const gameOverSpy = pubSubSpy.add(GAME_OVER);
        const boardMoveSpy = jest.spyOn(game.board, 'movePiece');

        for (let i = 0; i < 15; i += 1) {
          game.board.nextPiece = getTestPiece('O');
          runCommands(game, CONTROLS.HARD_DROP);
        }

        // only 10 O pieces can fit on the board
        expect(boardMoveSpy).toHaveBeenCalledTimes(10);
        expect(gameOverSpy).toHaveBeenCalled();

        runCommands(game, CONTROLS.LEFT);

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

        game.command(null, 'down');
        game.command(null, 'up');

        expect(setCommandSpy).toHaveBeenCalledTimes(0);
        expect(clearCommandSpy).toHaveBeenCalledTimes(0);
      });

      test('sends command queue if game status is falsey', () => {
        const sendQueueSpy = jest.spyOn(game, 'sendCommandQueue');

        game.command(CONTROLS.DOWN, 'down');

        expect(sendQueueSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('command queue', () => {
    test('add commands', () => {
      //
      game.unsubscribe();
      game = getNewTestGame('I', p2, p4);
      game[START_GAME]();
      gameLoop.autoCommand = undefined;

      runCommands(game, CONTROLS.LEFT, CONTROLS.RIGHT, CONTROLS.DOWN, CONTROLS.ROTATE_LEFT);

      expect(game.commandQueue).toEqual(['LEFT', 'RIGHT', 'DOWN', 'ROTATE_LEFT']);
    });

    test('send commands', () => {
      game[START_GAME]();
      const sendMessageSpy = pubSubSpy.add(SEND_MESSAGE);

      expect(game.commandQueue.length).toBe(0);

      const { ROTATE_RIGHT, HARD_DROP, LEFT } = CONTROLS;
      runCommands(game, ROTATE_RIGHT, HARD_DROP, LEFT, HARD_DROP);

      expect(game.commandQueue.length).toBe(0);
      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
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

      runCommands(game, CONTROLS.PLAYER3);

      // command queue should contain actual player id, whereas CONTROLS.PLAYER3
      // represents the player's board position relative to the one using the command
      expect(game.commandQueue).toEqual(['PLAYER4']);
    });

    test('sends command queue', () => {
      game.sendCommandQueue = jest.fn();

      runCommands(game, CONTROLS.PLAYER2);

      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);

      runCommands(game, CONTROLS.PLAYER4);
      // should not send if player not found
      expect(game.sendCommandQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe('publish / subscribe', () => {
    describe('START_GAME / GAME_OVER', () => {
      test('START_GAME should start game', () => {
        const drawSpy = pubSubSpy.add(DRAW);
        const updateScoreSpy = pubSubSpy.add(UPDATE_SCORE);

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

        publish(GAME_OVER, { id: game.playerId });

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

        publish(ADD_PLAYER, p2);

        expect(game.players).toContain(p2);
        expect(mapTargetsSpy).toHaveBeenCalledTimes(1);
      });

      test('should not add player if game started', () => {
        game[START_GAME]();

        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(0);
      });

      test('should not add player if player already added', () => {
        publish(ADD_PLAYER, p2);
        publish(ADD_PLAYER, p2);

        expect(game.players.length).toBe(1);
      });
    });

    describe('REMOVE_PLAYER', () => {
      beforeEach(() => {
        game.addPlayer(p2);
      });

      test('should remove player and call mapPlayerTargets', () => {
        const mapTargetsSpy = jest.spyOn(game, 'mapPlayerTargets');

        publish(REMOVE_PLAYER, p2);

        expect(game.players.length).toBe(0);
        expect(mapTargetsSpy).toHaveBeenCalledTimes(1);
      });

      test('should not remove player if no id match', () => {
        publish(REMOVE_PLAYER, p3);

        expect(game.players.length).toBe(1);
      });
    });

    describe('UPDATE_PLAYER', () => {
      beforeEach(() => {
        game[START_GAME]();
      });

      test('should replace board if player id matches', () => {
        const newBoard = getTestBoard('pattern1');
        const emptyBoard = getTestBoard('empty');

        expect(game.board.grid).toEqual(emptyBoard);

        publish(UPDATE_PLAYER, { id: 1, board: newBoard });

        expect(game.board.grid).toEqual(newBoard);
      });

      test('should not replace board if player id does not match', () => {
        const newBoard = getTestBoard('pattern1');
        const emptyBoard = getTestBoard('empty');

        expect(game.board.grid).toEqual(emptyBoard);

        publish(UPDATE_PLAYER, { id: p2, board: newBoard });

        expect(game.board.grid).toEqual(emptyBoard);
      });
    });

    test('BOARD_CHANGE should send command queue', () => {
      const sendQueueSpy = jest.spyOn(game, 'sendCommandQueue');

      expect(sendQueueSpy).toHaveBeenCalledTimes(0);

      publish(BOARD_CHANGE);

      expect(sendQueueSpy).toHaveBeenCalledTimes(1);
    });

    test('LOWER_PIECE should publish score update', () => {
      const updateScoreSpy = pubSubSpy.add(UPDATE_SCORE);

      publish(LOWER_PIECE);

      expect(updateScoreSpy).toHaveBeenCalledTimes(1);
      expect(updateScoreSpy).toHaveBeenLastCalledWith({ score: game.score });
    });
  });
});
