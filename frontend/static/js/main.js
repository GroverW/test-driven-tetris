const Game = require('./game');
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
}

const gameId = 1;
const ws = new WebSocket(`ws://localhost:3000/game/${gameId}`);

let game, gameDOM, api;

ws.onopen = evt => {
  console.log(evt);
  console.log('connected');
  let data = {type: "join", name: 'floop'};
  ws.send(JSON.stringify(data));
}

ws.onmessage = evt => {
  const { type, data } = JSON.parse(evt.data);
  console.log("WHAT GOT PARSED", type, data);
  if(type === 'addPlayer') {
    if(!game) {
      gameDOM = new GameDOM(selectors, data);
      game = new Game(data);
      api = new Api(ws);
      return;
    }
    publish('addPlayer', data);
  }

  if(type === 'removePlayer') {
    publish('removePlayer', data);
  }

  if(type === 'startGame') {
    game.start(data);
  }

  if(type === 'addPieces') {
    console.log('DID IT HAPPEN?');
    game.board.pieceList.addSet(data);
  }

  if(type === 'gameOver') {
    game.gameOver(data);
    gameDOM.gameOver(data);
  }
}

const btn = document.getElementById('test');

btn.addEventListener('click', () => {
  ws.send(JSON.stringify({type: 'newGame', data: ''}))
})

document.addEventListener('keydown', event => {
  if(game) game.command(event.which);
});