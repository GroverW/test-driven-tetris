const axios = require('axios');

const ClientGame = require('frontend/static/js/ClientGame');
const gameLoop = require('frontend/static/js/GameLoop');
const gameDOM = require('frontend/static/js/GameDOM');

const { PLAY, TOGGLE_MENU, ADD_PLAYER } = require('frontend/helpers/clientTopics');
const { publishError } = require('frontend/helpers/clientUtils');
const { addPowerUpTargetId } = require('frontend/static/js/GameDOM/DOMHelpers');
const Api = require('./Api');
const { publish } = require('./pubSub');
const {
  gameSelectors,
  startButton,
  gameIdSelector,
  powerUpContainer,
} = require('./DOMSelectors');

/**
 * Gets the base url of the current environment and converts it to
 * a web socket url
 * @returns {string} - base url (e.g. wss://www.example.com/)
 */
const getBaseURL = () => {
  const [httpProtocol,, hostname] = document.URL.split('/');
  const wsProtocol = httpProtocol === 'https:' ? 'wss:' : 'ws:';

  return `${wsProtocol}//${hostname}`;
};

/**
 * Creates event listeners for starting game, and keyboard controls
 * @param {object} game - instance of ClientGame class
 * @param {object} api - instance of Api class
 */
const createEventListeners = (game, api) => {
  startButton.addEventListener('click', (evt) => {
    evt.target.blur();
    publish(PLAY);
    api.sendMessage({ type: PLAY, data: '' });
  });

  document.addEventListener('keydown', (evt) => {
    game.command(evt.which, 'down');
  });

  document.addEventListener('keyup', (evt) => {
    game.command(evt.which, 'up');
  });
};

/**
 * Connects to an already created game
 * @param {string} gameId - game id
 * @param {string} gameType - game type
 */
const connectToGame = (gameId, gameType) => {
  if (gameType === 'multi') {
    gameIdSelector.innerText = `Game ID: ${gameId}`;
    addPowerUpTargetId(gameSelectors.player, 1);
    powerUpContainer.classList.remove('hide');
  }

  const baseURL = getBaseURL();
  const ws = new WebSocket(`${baseURL}/game/${gameId}`);

  let game; let api;

  /**
   * What to do when the websocket is closed
   */
  ws.onclose = (evt) => {
    const data = evt.reason || 'Something went wrong, please try again.';
    publishError(data);
  };

  /**
   * What to do when receiving a message over the websocket
   */
  ws.onmessage = (evt) => {
    const { type, data } = JSON.parse(evt.data);

    if (type === ADD_PLAYER && !game) {
      gameDOM.initialize(gameSelectors, data);
      game = new ClientGame(data);
      gameLoop.initialize(data);
      api = new Api(ws);
      createEventListeners(game, api);
      gameSelectors.message.classList.remove('hide');
      publish(TOGGLE_MENU);
      return;
    }

    publish(type, data);
  };
};

/**
 * Creates a new single, or multiplayer game
 * @param {string} type - 'single' or 'multi'
 */
const createGame = async (type) => {
  try {
    const response = await axios.post(`/game/${type}`);

    const { gameId } = response.data;

    connectToGame(gameId, type);
  } catch (err) {
    publishError('Oops... could not connect');
  }
};

/**
 * Joins an existing multiplayer game
 * @param {string} id - game id
 */
const joinGame = async (id) => {
  try {
    const response = await axios.get(`/game/multi/${id}`);

    const { gameId } = response.data;

    connectToGame(gameId, 'multi');
  } catch (err) {
    const message = err.response.data.error || 'Could not join game';
    publishError(message);
  }
};

module.exports = {
  createGame,
  joinGame,
  connectToGame,
};
