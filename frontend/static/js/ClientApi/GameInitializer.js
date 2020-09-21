const ClientGame = require('frontend/static/js/ClientGame');
const gameDOM = require('frontend/static/js/GameDOM');
const gameLoop = require('frontend/static/js/GameLoop');
const { createNullObject } = require('frontend/helpers/utils');
const { publish } = require('frontend/helpers/pubSub');
const { gameSelectors } = require('frontend/helpers/DOMSelectors');
const { TOGGLE_MENU } = require('frontend/topics');
const { createGameEventListeners } = require('./helpers');

class GameInitializer {
  constructor() {
    this.currentGame = createNullObject(ClientGame);
    createGameEventListeners(this);
  }

  isGameInitialized() {
    return this.currentGame instanceof ClientGame;
  }

  command(key, keyDirection) {
    this.currentGame.command(key, keyDirection);
  }

  newGame(playerId) {
    gameDOM.initialize(gameSelectors, playerId);
    gameLoop.initialize(playerId);
    this.currentGame = new ClientGame(playerId);
    publish(TOGGLE_MENU);
  }
}

module.exports = GameInitializer;