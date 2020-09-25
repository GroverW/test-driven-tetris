const gameDOM = require('frontend/static/js/GameDOM');
const gameLoop = require('frontend/static/js/GameLoop');

const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/utils');

const { CONTROLS, POWER_UP_TYPES, LINES_PER_LEVEL } = require('frontend/constants');
const {
  PLAY,
  START_GAME,
  ADD_PLAYER,
  REMOVE_PLAYER,
  CLEAR_LINES,
  UPDATE_SCORE,
  ADD_POWER_UP,
  USE_POWER_UP,
  END_GAME,
  GAME_MESSAGE,
} = require('frontend/topics');
const {
  getMockDOMSelector,
  getMockGameDOMSelectors,
  getMockCtx,
  getNewTestGame,
  runCommands,
  mockAnimation,
  mockCancelAnimation,
  clearMocksAndUnsubscribe,
} = require('frontend/mocks');

describe('game DOM tests', () => {
  let game;
  let newCtx1; let newBoard1; let newId1; let newPlayer1;
  let newCtx2; let newBoard2; let newId2; let newPlayer2;
  let addPlayerSpy;

  beforeEach(() => {
    newCtx1 = getMockCtx();
    newId1 = 1;
    newId2 = 2;

    newPlayer1 = getNewPlayer(newCtx1, newBoard1, newId1);
    newPlayer2 = getNewPlayer(newCtx2, newBoard2, newId2);

    gameDOM.initialize(getMockGameDOMSelectors());
    game = getNewTestGame();
    gameLoop.initialize(2);
    addPlayerSpy = jest.spyOn(gameDOM.gameView, 'addPlayer');

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
    cancelAnimationFrame = jest.fn().mockImplementation(mockCancelAnimation);
  });

  afterEach(() => {
    clearMocksAndUnsubscribe(gameDOM, game, gameLoop);
  });

  describe('add / remove players', () => {
    describe('add player', () => {
      test('adds new player successfully', () => {
        publish(ADD_PLAYER, newPlayer1.id);

        expect(addPlayerSpy).toHaveBeenCalledTimes(1);
        expect(gameDOM.players.length).toBe(1);
        expect(gameDOM.gameView.players.length).toBe(1);
        expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
        expect(gameDOM.players[0].powerUpId.classList.contains('power-up-target')).toBe(true);
        expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
      });

      test('adding 3rd player resizes 2nd player', () => {
        publish(ADD_PLAYER, newPlayer1.id);
        publish(ADD_PLAYER, newPlayer2.id);

        expect(addPlayerSpy).toHaveBeenCalledTimes(2);
        expect(gameDOM.players.length).toBe(2);
        expect(gameDOM.gameView.players.length).toBe(2);
        expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
        expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);
      });

      test('does not add player if id matches Game DOM player id', () => {

      });
    });

    describe('remove player', () => {
      beforeEach(() => {
        publish(ADD_PLAYER, newPlayer1.id);
        publish(ADD_PLAYER, newPlayer2.id);
      });

      test('removes player successfully', () => {
        publish(REMOVE_PLAYER, newPlayer2.id);

        expect(gameDOM.players.length).toBe(1);
        expect(gameDOM.gameView.players.length).toBe(1);
      });

      test('removing player updates power up targets', () => {
        expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
        expect(gameDOM.players[1].powerUpId.innerText).toBe(3);

        publish(REMOVE_PLAYER, newPlayer1.id);

        expect(gameDOM.players.length).toBe(1);
        expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
      });

      test('removing 3rd player resizes 2nd player', () => {
        expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
        expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);

        publish(REMOVE_PLAYER, newPlayer1.id);

        expect(gameDOM.players.length).toBe(1);
        expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
        expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(false);
      });

      test('does not remove player if id matches game DOM player id', () => {
        const resizeSpy = jest.spyOn(gameDOM, 'resizePlayer2');
        const updatePowerUpTargetIdsSpy = jest.spyOn(gameDOM, 'updatePowerUpTargetIds');

        expect(gameDOM.players.length).toBe(2);

        publish(REMOVE_PLAYER, gameDOM.playerId);

        expect(gameDOM.players.length).toBe(2);
        expect(resizeSpy).toHaveBeenCalledTimes(0);
        expect(updatePowerUpTargetIdsSpy).toHaveBeenCalledTimes(0);
      });

      test('does not remove or resize player if id does not match', () => {
        expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);
        expect(gameDOM.players.length).toBe(2);

        publish(REMOVE_PLAYER, 'fake id');

        expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);
        expect(gameDOM.players.length).toBe(2);
      });
    });
  });

  describe('start game', () => {
    test('clear message and start music on game start', () => {
      expect(gameDOM.music.play).toHaveBeenCalledTimes(0);
      expect(gameDOM.message.classList.contains('hide')).toBe(false);

      gameDOM.startGame();

      expect(gameDOM.music.play).toHaveBeenCalledTimes(1);
      expect(gameDOM.message.classList.contains('hide')).toBe(true);
    });

    test('gameDOM should subscribe to GAME_MESSAGE topic when player ready', () => {
      const testMessage = { header: 'hi', body: ['this', 'is', 'a', 'message'] };
      const appendChildSpy = jest.spyOn(gameDOM.message, 'appendChild');
      const addSubscriptionSpy = jest.spyOn(gameDOM, 'addSubscription');

      publish(GAME_MESSAGE, {});

      expect(appendChildSpy).not.toHaveBeenCalled();

      publish(PLAY);

      expect(addSubscriptionSpy).toHaveBeenLastCalledWith(GAME_MESSAGE);

      publish(GAME_MESSAGE, testMessage);
      expect(appendChildSpy).toHaveBeenCalled();
    });
  });

  describe('game message', () => {
    beforeEach(() => {
      publish(PLAY);
    });

    test('gameDOM should add game message when topic published', () => {
      const testMessage = { header: 'hi', body: ['this', 'is', 'a', 'message'] };

      expect(gameDOM.message.children.length).toBe(0);

      publish(GAME_MESSAGE, testMessage);

      expect(gameDOM.message.children.length).toBe(1);
      expect(gameDOM.message.children[0].children.length).toBe(5);
    });
  });

  describe('scoreboard', () => {
    test('updates on game start', () => {
      expect(gameDOM.score.innerText).toBe('');
      expect(gameDOM.level.innerText).toBe('');
      expect(gameDOM.lines.innerText).toBe('');

      game[START_GAME]();
      gameLoop[START_GAME]();

      expect(gameDOM.score.innerText).toBe(0);
      expect(gameDOM.level.innerText).toBe(1);
      expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL);
    });

    describe('scoreboard updates', () => {
      beforeEach(() => {
        game[START_GAME]();
        gameLoop[START_GAME]();
      });

      test('updates points when piece moves down', () => {
        runCommands(game, CONTROLS.DOWN);

        expect(gameDOM.score.innerText).toBe(1);
      });

      test('updates on line clear (tetris)', () => {
        expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL);

        publish(CLEAR_LINES, 4);

        expect(gameDOM.score.innerText).toBe(800);
        expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 4);
      });

      test('updates on level increase', () => {
        expect(gameDOM.level.innerText).toBe(1);

        publish(CLEAR_LINES, 4);

        expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 4);
        expect(gameDOM.level.innerText).toBe(1);

        publish(CLEAR_LINES, 4);
        publish(CLEAR_LINES, 4);

        expect(gameDOM.level.innerText).toBe(2);
      });
    });
  });

  describe('end game', () => {
    test('should unsubscribe and stop updating after game ends', () => {
      const currScore = gameDOM.score.innerText;

      publish(END_GAME);

      publish(UPDATE_SCORE, { score: currScore + 1 });

      expect(gameDOM.score.innerText).toBe(currScore);
    });
  });
});
