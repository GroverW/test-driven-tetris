const GameDOM = require('frontend/static/js/GameDOM');
const GameLoop = require('frontend/static/js/GameLoop');
const { Piece } = require('common/js/Piece');
const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/clientUtils');
const {
  CONTROLS,
  PIECE_TYPES,
  POWER_UP_TYPES,
  LINES_PER_LEVEL,
} = require('frontend/helpers/clientConstants');
const {
  PLAY,
  ADD_PLAYER,
  REMOVE_PLAYER,
  START_GAME,
  CLEAR_LINES,
  ADD_POWER_UP,
  USE_POWER_UP,
  GAME_MESSAGE,
} = require('frontend/helpers/clientTopics');
const { 
  getMockDOMSelector,
  getMockGameDOMSelectors,
  getMockCtx,
  getTestBoard,
  getNewTestGame,
  runCommand,
  mockAnimation,
} = require('frontend/mockData/mocks');

describe('game DOM tests', () => {
  let gameDOM;
  let game;
  let gameLoop;
  let newCtx1, newBoard1, newId1;
  let newCtx2, newBoard2, newId2;
  let addPlayerSpy;

  beforeAll(() => {
    mockCtx = getMockCtx();
    mockCtxNext = getMockCtx();
    newCtx1 = getMockCtx();
    newId1 = 1;
    newId2 = 2;
  
    newPlayer1 = getNewPlayer(newCtx1, newBoard1, newId1);
    newPlayer2 = getNewPlayer(newCtx2, newBoard2, newId2);
  
    gameDOM = new GameDOM(getMockGameDOMSelectors());
    game = getNewTestGame(game);
    gameLoop = new GameLoop(2);
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
      publish(ADD_PLAYER, newPlayer1.id)
  
      expect(addPlayerSpy).toHaveBeenCalledTimes(1);;
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
      const clearMessageSpy = jest.spyOn(gameDOM, 'clearMessage');
  
      expect(gameDOM.music.play).toHaveBeenCalledTimes(0);
      expect(clearMessageSpy).toHaveBeenCalledTimes(0);
  
      gameDOM.startGame();
  
      expect(clearMessageSpy).toHaveBeenCalledTimes(1);
      expect(gameDOM.music.play).toHaveBeenCalledTimes(1);
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
      
      expect(gameDOM.message.appendChild).toHaveBeenCalledTimes(0);
  
      publish(GAME_MESSAGE, testMessage);
  
      expect(gameDOM.message.appendChild).toHaveBeenCalledTimes(1);
    });
  });

  describe('scoreboard', () => {
    test('updates on game start', () => {
      expect(gameDOM.score.innerText).toBe("");
      expect(gameDOM.level.innerText).toBe("");
      expect(gameDOM.lines.innerText).toBe("");
      
      game.start();
      gameLoop.animate();
  
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
      
      expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(1);
  
      publish(ADD_POWER_UP, -5);
  
      expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(1);
  
      publish(ADD_POWER_UP, POWER_UP_TYPES.SCRAMBLE_BOARD);
      
      expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(2);
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
});