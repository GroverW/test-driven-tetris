const axios = require('axios');

const ClientGame = require('frontend/static/js/clientGame');
const GameDOM = require('frontend/static/js/gameDOM');

const Api = require('./api');
const { publish } = require('./pubSub');
const { gameIdSelector, gameSelectors, startButton } = require('./DOMSelectors')


const addGameIdToStats = (id) => {
  gameIdSelector.innerText = id;
}

const createGame = async type => {
  try {
    const response = await axios.get(`/game/${type}`);

    const gameId = response.data.gameId;

    connectToGame(gameId);

    (type === 'multi') && addGameIdToStats(gameId);
  } catch (err) {
    console.log(err.response);
  }
}

const connectToGame = (gameId) => {
  const ws = new WebSocket(`ws://localhost:3000/game/${gameId}`);

  let game, gameDOM, api;

  ws.onopen = evt => {
    console.log(evt);
    console.log('connected');
    let data = { type: "join", name: 'floop' };
    ws.send(JSON.stringify(data));
  }

  ws.onclose = evt => {
    console.log('connection closed by server');
    console.log(evt);
  }

  ws.onmessage = evt => {
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
        console.log('start er up')
        if(game) game.start(data);
        break;
      case 'updatePlayer':
        publish('updatePlayerBoard', data);
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

const createEventListeners = (game, api) => {
  startButton.addEventListener('click', event => {
    event.target.blur();
    api.sendMessage({ type: 'play', data: '' })
  })

  document.addEventListener('keydown', event => {
    game.toggleMove(event.which, 'down');
  });

  document.addEventListener('keyup', event => {
    game.toggleMove(event.which, 'up');
  })
}

module.exports = {
  createGame,
  connectToGame,
};