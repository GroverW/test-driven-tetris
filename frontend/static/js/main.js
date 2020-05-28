const axios = require('axios');

const ClientGame = require('./clientGame');
const GameDOM = require('./gameDOM');
const { publish } = require('../../helpers/pubSub');
const Api = require('../../helpers/api');

const p1Canvas = document.getElementById('p1-board');
const nextPieceCanvas = document.getElementById('next-piece');
const selectors = {
  playerCtx: p1Canvas.getContext('2d'),
  nextCtx: nextPieceCanvas.getContext('2d'),
  gameContainer: document.getElementById('game-container'),
  scoreSelector: document.getElementById('game-score'),
  levelSelector: document.getElementById('game-level'),
  linesSelector: document.getElementById('game-lines'),
  playerSelector: document.getElementById('p1'),
}

const menuSelectors = {
  menuContainer: document.getElementById('menu'),
  newSinglePlayer: document.getElementById('newSinglePlayer'),
  newMultiplayer: document.getElementById('newMultiplayer'),
  joinMultiplayer: document.getElementById('joinMultiplayer'),
  multiplayerGameId: document.getElementById('multiplayerGameId'),
}

let gameId;

menuSelectors.newSinglePlayer.addEventListener('click', event => {
  event.target.blur();
  menuSelectors.menuContainer.classList.toggle('hide');
  createGame('single')
})

menuSelectors.newMultiplayer.addEventListener('click', event => {
  event.target.blur();
  menuSelectors.menuContainer.classList.toggle('hide');
  createGame('multi');
});

menuSelectors.joinMultiplayer.addEventListener('submit', event => {
  event.preventDefault();
  event.target.blur();
  
  menuSelectors.menuContainer.classList.toggle('hide');
  
  gameId = menuSelectors.multiplayerGameId.value;
  connectToGame(gameId);
});

const addGameIdToStats = (id) => {
  const gameIdSelector = document.getElementById('game-id');
  gameIdSelector.innerText = id;
}

const createGame = async type => {
  try {
    const response = await axios.get(`/game/${type}`);

    gameId = response.data.gameId;

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
    if (type === 'addPlayer') {
      if (!game) {
        gameDOM = new GameDOM(selectors, data);
        game = new ClientGame(data);
        api = new Api(ws);
        return;
      }
      publish('addPlayer', data);
    }

    if (type === 'removePlayer') {
      publish('removePlayer', data);
    }

    if (type === 'startGame') {
      game.start(data);
    }

    if (type === 'updatePlayer') {
      publish('updatePlayerBoard', data);
    }

    if (type === 'addPieces') {
      console.log('DID IT HAPPEN?');
      game.board.pieceList.addSet(data);
    }

    if (type === 'gameOver') {
      game.gameOver(data);
      gameDOM.gameOver(data);
    }
  }

  const btn = document.getElementById('start');

  btn.addEventListener('click', event => {
    event.target.blur();
    api.sendMessage({ type: 'play', data: '' })
  })

  document.addEventListener('keydown', event => {
    if (game) game.toggleMove(event.which, 'down');
  });

  document.addEventListener('keyup', event => {
    if (game) game.toggleMove(event.which, 'up');
  })
}