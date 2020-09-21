const ClientGame = require('frontend/static/js/ClientGame');
const { createNullObject } = require('frontend/helpers/utils');
const { getMockDOMSelector } = require('frontend/mocks');

document.querySelector = jest.fn().mockImplementation(getMockDOMSelector);
document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);

const GameInitializer = require('frontend/static/js/ClientApi/GameInitializer');

describe('game initializer tests', () => {
  let gameInitializer;

  beforeEach(() => {
    gameInitializer = new GameInitializer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    test('expect current game to be a null object, event listeners to be setup', () => {
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

  describe('initialize', () => {
    test('initialize creates new client game, ', () => {

    });
  });
});
