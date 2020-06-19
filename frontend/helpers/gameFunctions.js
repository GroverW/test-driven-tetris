const axios = require('axios');

const ClientGame = require('frontend/static/js/ClientGame');
const GameDOM = require('frontend/static/js/GameDOM');

const Api = require('./api');
const { publish } = require('./pubSub');
const { gameIdSelector, gameSelectors, startButton } = require('./DOMSelectors')
const {
  ADD_ERROR,
  TOGGLE_MENU,
  ADD_PLAYER,
  REMOVE_PLAYER,
  START_GAME,
  UPDATE_PLAYER,
  ADD_POWER_UP,
} = require('frontend/helpers/clientTopics');

/**
 * Adds game id to stats container for sharing
 * @param {string} id - game id
 */
const addGameIdToStats = (id) => {
  gameIdSelector.innerText = id;
}

/**
 * Creates a new single, or multiplayer game
 * @param {string} type - 'single' or 'multi'
 */
const createGame = async (type) => {
  try {
    const response = await axios.get(`/game/${type}`);

    const gameId = response.data.gameId;

    connectToGame(gameId);

    if (type === 'multi') addGameIdToStats(gameId);
  } catch (err) {
    console.log(err.response);
  }
}

/**
 * Connects to an already created game
 * @param {string} gameId - game id
 */
const connectToGame = (gameId) => {
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
    console.log('connection closed by server');
    const data = evt.reason || 'Something went wrong, please try again.';
    publish(ADD_ERROR, data);
  }

  /**
   * What to do when receiving a message over the websocket
   */
  ws.onmessage = (evt) => {
    const { type, data } = JSON.parse(evt.data);
    console.log('WHAT GOT PARSED', type, data);
    
    switch(type) {
      case ADD_PLAYER:
        if (!game) {
          gameDOM = new GameDOM(gameSelectors, data);
          game = new ClientGame(data);
          api = new Api(ws);
          createEventListeners(game, api);
          publish(TOGGLE_MENU);
          return;
        }
        publish(ADD_PLAYER, data);
        break;
      case REMOVE_PLAYER:
        publish(REMOVE_PLAYER, data);
        break;
      case START_GAME:
        publish(START_GAME);
        break;
      case UPDATE_PLAYER:
        publish(UPDATE_PLAYER, data);
        break;
      case ADD_POWER_UP:
        publish(ADD_POWER_UP, data);
        break;
      case 'addPieces':
        if(game) game.board.pieceList.addSet(data);
        break;
      case GAME_OVER:
        if(game) game.gameOver(data);
        if(gameDOM) gameDOM.gameOver(data);
        break;
      case 'error':
        publish(ADD_ERROR, data);
        break;
      default:
        break;
    }
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
    api.sendMessage({ type: 'play', data: '' })
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
  connectToGame,
};