const gameDOM = require('frontend/static/js/GameDOM');
const gameLoop = require('frontend/static/js/GameLoop');

const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/clientUtils');

const { CONTROLS, POWER_UP_TYPES, LINES_PER_LEVEL } = require('frontend/helpers/clientConstants');
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
} = require('frontend/helpers/clientTopics');
const {
  getMockDOMSelector,
  getMockGameDOMSelectors,
  getMockCtx,
  getNewTestGame,
  runCommand,
  mockAnimation,
} = require('frontend/mockData/mocks');

describe('game DOM tests', () => {
  let game;
  let newCtx1; let newBoard1; let newId1; let newPlayer1;
  let newCtx2; let newBoard2; let newId2; let newPlayer2;
  let addPlayerSpy;

  beforeAll(() => {
    newCtx1 = getMockCtx();
    newId1 = 1;
    newId2 = 2;

    newPlayer1 = getNewPlayer(newCtx1, newBoard1, newId1);
    newPlayer2 = getNewPlayer(newCtx2, newBoard2, newId2);

    gameDOM.initialize(getMockGameDOMSelectors());
    game = getNewTestGame(game);
    gameLoop.initialize(2);
  });

  afterAll(() => {
    gameDOM.unsubscribe();
    game.unsubscribe();
    gameLoop.unsubscribe();
  });

  beforeEach(() => {
    addPlayerSpy = jest.spyOn(gameDOM.gameView, 'addPlayer');

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);
    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add / remove players', () => {
    test('add player', () => {
      publish(ADD_PLAYER, newPlayer1.id);

      expect(addPlayerSpy).toHaveBeenCalledTimes(1);
      expect(gameDOM.players.length).toBe(1);
      expect(gameDOM.gameView.players.length).toBe(1);
      expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
      expect(gameDOM.players[0].powerUpId.classList.contains('power-up-target')).toBe(true);
      expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
    });

    test('add 3rd player resizes 2nd player', () => {
      publish(ADD_PLAYER, newPlayer2.id);

      expect(addPlayerSpy).toHaveBeenCalledTimes(1);
      expect(gameDOM.players.length).toBe(2);
      expect(gameDOM.gameView.players.length).toBe(2);
      expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
      expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);
    });

    test('remove player', () => {
      publish(REMOVE_PLAYER, newPlayer2.id);

      expect(gameDOM.players.length).toBe(1);
      expect(gameDOM.gameView.players.length).toBe(1);
    });

    test('remove player - update power up targets', () => {
      publish(ADD_PLAYER, newPlayer2.id);

      expect(gameDOM.players.length).toBe(2);
      expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
      expect(gameDOM.players[1].powerUpId.innerText).toBe(3);

      publish(REMOVE_PLAYER, newPlayer1.id);

      expect(gameDOM.players.length).toBe(1);
      expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
    });

    test('remove 3rd player resizes 2nd player', () => {
      publish(ADD_PLAYER, newPlayer1.id);

      expect(addPlayerSpy).toHaveBeenCalledTimes(1);
      expect(gameDOM.players.length).toBe(2);
      expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
      expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);

      publish(REMOVE_PLAYER, newPlayer1.id);

      expect(gameDOM.players.length).toBe(1);
      expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
      expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(false);
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
      const numSubscriptions = gameDOM.subscriptions.length;

      publish(PLAY);

      expect(gameDOM.subscriptions.length).toBeGreaterThan(numSubscriptions);
    });
  });

  describe('game message', () => {
    test('gameDOM should add game message when topic published', () => {
      const testMessage = { header: 'hi', body: [] };

      expect(gameDOM.message.children.length).toBe(0);

      publish(GAME_MESSAGE, testMessage);

      expect(gameDOM.message.children.length).toBeGreaterThan(0);
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

    test('updates points when piece moves down', () => {
      runCommand(game, CONTROLS.DOWN);

      expect(gameDOM.score.innerText).toBe(1);
    });

    test('updates on line clear (tetris)', () => {
      expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL);

      publish(CLEAR_LINES, 4);

      expect(gameDOM.score.innerText).toBe(801);
      expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 4);
    });

    test('updates on level increase', () => {
      expect(gameDOM.level.innerText).toBe(1);

      publish(CLEAR_LINES, 4);

      expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 8);
      expect(gameDOM.level.innerText).toBe(1);

      publish(CLEAR_LINES, 4);

      expect(gameDOM.level.innerText).toBe(2);
    });
  });

  describe('power ups', () => {
    test('adds power up', () => {
      publish(ADD_POWER_UP, POWER_UP_TYPES.SWAP_LINES);

      expect(gameDOM.powerUps.filter((p) => p.type !== null).length).toBe(1);

      publish(ADD_POWER_UP, -5);

      expect(gameDOM.powerUps.filter((p) => p.type !== null).length).toBe(1);

      publish(ADD_POWER_UP, POWER_UP_TYPES.SCRAMBLE_BOARD);

      expect(gameDOM.powerUps.filter((p) => p.type !== null).length).toBe(2);
    });

    test('uses power up', () => {
      const id1 = POWER_UP_TYPES.SWAP_LINES;
      const id2 = POWER_UP_TYPES.SCRAMBLE_BOARD;
      expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id1}`)).toBe(true);
      expect(gameDOM.powerUps[1].node.classList.contains(`power-up${id2}`)).toBe(true);

      publish(USE_POWER_UP);

      expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id2}`)).toBe(true);
      expect(gameDOM.powerUps[1].node.classList.contains(`power-up${id2}`)).toBe(false);

      publish(USE_POWER_UP);

      expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id2}`)).toBe(false);

      expect(gameDOM.powerUps[0].node.classList.classes.length).toBe(0);
      expect(gameDOM.powerUps[1].node.classList.classes.length).toBe(0);
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
