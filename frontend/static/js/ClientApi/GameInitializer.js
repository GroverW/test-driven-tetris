const ClientGame = require('frontend/static/js/ClientGame');
const { createNullObject } = require('frontend/helpers/utils');
const { createGameEventListeners } = require('./helpers');

class GameInitializer {
  constructor() {
    this.currentGame = createNullObject(ClientGame);
    createGameEventListeners(this);
  }

  command(key, keyDirection) {
    this.currentGame.command(key, keyDirection);
  }
}

module.exports = GameInitializer;