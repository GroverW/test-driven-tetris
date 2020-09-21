const { startButton } = require('frontend/helpers/DOMSelectors');
const { publish } = require('frontend/helpers/pubSub');
const { PLAY } = require('frontend/topics');

/**
 * Creates event listeners for starting game, and keyboard controls
 * @param {object} game - current clientGame
 */
const createGameEventListeners = (game) => {
  startButton.addEventListener('click', (evt) => {
    evt.target.blur();
    publish(PLAY);
  });

  document.addEventListener('keydown', (evt) => {
    game.command(evt.which, 'down');
  });

  document.addEventListener('keyup', (evt) => {
    game.command(evt.which, 'up');
  });
};

module.exports = {
  createGameEventListeners,
};
