const ClientGame = require('frontend/static/js/ClientGame');
const gameDOM = require('frontend/static/js/GameDOM');
const gameLoop = require('frontend/static/js/GameLoop');
const { createNullObject } = require('frontend/helpers/utils');
const { getMockDOMSelector } = require('frontend/mocks');

document.querySelector = jest.fn().mockImplementation(getMockDOMSelector);
document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);

const GameInitializer = require('frontend/static/js/ClientApi/GameInitializer');
const { pubSubMock } = require('frontend/mocks');
const { TOGGLE_MENU } = require('frontend/topics');

describe('game initializer tests', () => {
  let gameInitializer;
  let pubSubSpy;
  const playerId = 1;

  beforeEach(() => {
    gameInitializer = new GameInitializer();
    pubSubSpy = pubSubMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('expect current game to be a null object, event listeners to be setup', () => {
      expect(gameInitializer.isGameInitialized()).toBe(false);
      Object.getOwnPropertyNames(ClientGame.prototype)
        .forEach((propertyName) => {
          expect(gameInitializer.currentGame[propertyName]).not.toBe(undefined);
        });
    });
  });

  describe('keyboard commands', () => {
    test('keyboard events should trigger commands for the current game', () => {
      const game1 = gameInitializer.currentGame;
      const game2 = createNullObject(ClientGame);
      const command1Spy = jest.spyOn(game1, 'command');
      const command2Spy = jest.spyOn(game2, 'command');

      expect(command1Spy).toHaveBeenCalledTimes(0);
      expect(command2Spy).toHaveBeenCalledTimes(0);

      document.dispatchEvent(new KeyboardEvent('keydown'));

      expect(command1Spy).toHaveBeenCalledTimes(1);
      expect(command2Spy).toHaveBeenCalledTimes(0);

      gameInitializer.currentGame = game2;

      document.dispatchEvent(new KeyboardEvent('keydown'));

      expect(command1Spy).toHaveBeenCalledTimes(1);
      expect(command2Spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('new game', () => {
    test('creates new client game, initializes gameDOM and gameLoop, toggles menu', () => {
      const gameDOMSpy = jest.spyOn(gameDOM, 'initialize');
      const gameLoopSpy = jest.spyOn(gameLoop, 'initialize');
      const toggleMenuSpy = pubSubSpy.add(TOGGLE_MENU);

      gameInitializer.newGame(playerId);

      expect(gameDOMSpy).toHaveBeenLastCalledWith(expect.any(Object), playerId);
      expect(gameLoopSpy).toHaveBeenLastCalledWith(playerId);
      expect(toggleMenuSpy).toHaveBeenCalledTimes(1);
      expect(gameInitializer.isGameInitialized()).toBe(true);
    });
  });
});
