const menuSelectors = {
  menuContainer: document.getElementById('menu'),
  newSinglePlayer: document.getElementById('newSinglePlayer'),
  newMultiplayer: document.getElementById('newMultiplayer'),
  joinMultiplayer: document.getElementById('joinMultiplayer'),
  multiplayerGameId: document.getElementById('multiplayerGameId'),
};

const p1Canvas = document.getElementById('p1-board');

const nextPieceCanvas = document.getElementById('next-piece');

const gameIdSelector = document.getElementById('game-id');

const startButton = document.getElementById('start');

const gameSelectors = {
  playerCtx: p1Canvas.getContext('2d'),
  nextCtx: nextPieceCanvas.getContext('2d'),
  gameContainer: document.getElementById('game-container'),
  score: document.getElementById('game-score'),
  level: document.getElementById('game-level'),
  lines: document.getElementById('game-lines'),
  player: document.getElementById('p1'),
  powerUps: [
    document.getElementById('pUp1'),
    document.getElementById('pUp2')
  ],
};

module.exports = {
  menuSelectors,
  p1Canvas,
  nextPieceCanvas,
  gameIdSelector,
  startButton,
  gameSelectors,
};