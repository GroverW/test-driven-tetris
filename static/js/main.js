const Game = require('./game');
const GameView = require('./gameView');

const p1Canvas = document.getElementById('p1-board');
const p1Ctx = p1Canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');

const test = new Game();
const testView = new GameView(p1Ctx, nextPieceCtx);

console.log(test);