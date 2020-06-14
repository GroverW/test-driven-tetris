const axios = require('axios');

const ClientGame = require('frontend/static/js/clientGame');
const GameDOM = require('frontend/static/js/gameDOM');

const Api = require('./api');
const { publish } = require('./pubSub');
const { gameIdSelector, gameSelectors, startButton } = require('./DOMSelectors')

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
    // let data = { type: "join", name: 'floop' };
    // ws.send(JSON.stringify(data));
  }

  /**
   * What to do when the websocket is closed
   */
  ws.onclose = (evt) => {
    console.log('connection closed by server');
    console.log(evt);
  }

  /**
   * What to do when receiving a message over the websocket
   */
  ws.onmessage = (evt) => {
    const { type, data } = JSON.parse(evt.data);
    console.log("WHAT GOT PARSED", type, data);
    
    switch(type) {
      case 'addPlayer':
        if (!game) {
          gameDOM = new GameDOM(gameSelectors, data);
          game = new ClientGame(data);
          api = new Api(ws);
          createEventListeners(game, api);
          return;
        }
        publish('addPlayer', data);
        break;
      case 'removePlayer':
        publish('removePlayer', data);
        break;
      case 'startGame':
        publish('startGame');
        break;
      case 'updatePlayer':
        publish('updatePlayerBoard', data);
        break;
      case 'addPowerUp':
        publish('addPowerUp', data);
        break;
      case 'addPieces':
        if(game) game.board.pieceList.addSet(data);
        break;
      case 'gameOver':
        if(game) game.gameOver(data);
        if(gameDOM) gameDOM.gameOver(data);
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