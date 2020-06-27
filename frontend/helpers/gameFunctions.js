const axios = require('axios');

const ClientGame = require('frontend/static/js/ClientGame');
const GameDOM = require('frontend/static/js/GameDOM');

const Api = require('./Api');
const { publish } = require('./pubSub');
const { addText, addPowerUpTargetId } = require('./DOMUtils');
const {
  gameSelectors,
  startButton,
  gameIdSelector,
  powerUpContainer,
} = require('./DOMSelectors')
const {
  PLAY,
  TOGGLE_MENU,
  ADD_PLAYER,
} = require('frontend/helpers/clientTopics');
const { publishError } = require('frontend/helpers/clientUtils');

/**
 * Creates a new single, or multiplayer game
 * @param {string} type - 'single' or 'multi'
 */
const createGame = async (type) => {
  try {
    const response = await axios.post(`/game/${type}`);

    const gameId = response.data.gameId;

    connectToGame(gameId, type);
  } catch (err) {
    publishError('Oops... could not connect')
  }
}

const joinGame = async (id) => {
  try {
    const response = await axios.get(`/game/multi/${id}`);

    const gameId = response.data.gameId;

    connectToGame(gameId, 'multi');
  } catch (err) {
    const message = err.response.data.error || 'Could not join game';
    publishError(message)
  }
}

/**
 * Connects to an already created game
 * @param {string} gameId - game id
 */
const connectToGame = (gameId, type) => {
  if (type === 'multi') {
    addText(gameIdSelector, gameId);
    addPowerUpTargetId(gameSelectors.player, 1);
    powerUpContainer.classList.remove('hide');
  }

  const ws = new WebSocket(`ws://localhost:3000/game/${gameId}`);

  let game, gameDOM, api;

  /**
   * What to do when the websocket is opened
   */
  ws.onopen = (evt) => {
    console.log(evt);
    console.log('connected');
  }

  /**
   * What to do when the websocket is closed
   */
  ws.onclose = (evt) => {
    const data = evt.reason || 'Something went wrong, please try again.';
    publishError(data);
  }

  /**
   * What to do when receiving a message over the websocket
   */
  ws.onmessage = (evt) => {
    const { type, data } = JSON.parse(evt.data);
    console.log('WHAT GOT PARSED', type, data);

    if (type === ADD_PLAYER && !game) {
      gameDOM = new GameDOM(gameSelectors, data);
      game = new ClientGame(data);
      api = new Api(ws);
      createEventListeners(game, api);
      publish(TOGGLE_MENU);
      return;
    }

    publish(type, data);
  }
}

/**
 * Creates event listeners for starting game, and keyboard controls
 * @param {object} game - instance of ClientGame class
 * @param {object} api - instance of Api class
 */
const createEventListeners = (game, api) => {
  startButton.addEventListener('click', (evt) => {
    evt.target.blur();
    api.sendMessage({ type: PLAY, data: '' })
  })

  document.addEventListener('keydown', (evt) => {
    game.toggleMove(evt.which, 'down');
  });

  document.addEventListener('keyup', (evt) => {
    game.toggleMove(evt.which, 'up');
  })
}

module.exports = {
  createGame,
  joinGame,
  connectToGame,
};