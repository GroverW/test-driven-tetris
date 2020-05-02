const Game = require('./game');
const GameDOM = require('./gameDOM');
const { publish } = require('../../helpers/pubSub');

const p1Canvas = document.getElementById('p1-board');
const nextPieceCanvas = document.getElementById('next-piece');

const game = new Game();

const selectors = {
  playerCtx: p1Canvas.getContext('2d'),
  nextCtx: nextPieceCanvas.getContext('2d'),
  gameContainer: document.getElementById('game-container'),
  scoreSelector: document.getElementById('game-score'),
  levelSelector: document.getElementById('game-level'),
  linesSelector: document.getElementById('game-lines'),
}

const view = new GameDOM(selectors);
game.start();

let i = 1;
publish('addPlayer', i);

document.addEventListener('keydown', e => {
  game.command(event.which);
  (event.which === 78) && publish('addPlayer', ++i)
});