const GameInitializer = require('frontend/static/js/ClientApi/GameInitializer');
const ClientGame = require('frontend/static/js/ClientGame');

describe('game initializer tests', () => {
  let gameInitializer;

  beforeEach(() => {
    gameInitializer = new GameInitializer();
  });

  test('check clientgame keys', () => {
    const test = {}
    Object.getOwnPropertyNames(ClientGame.prototype).forEach((propertyName) => {
      test[propertyName] = () => {};
    });

    console.log(test);
  })
});
