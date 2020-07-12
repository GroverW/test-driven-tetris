const messageSelector = document.getElementById('flash-message');

const menuSelectors = {
  menuContainer: document.getElementById('menu-container'),
  newSinglePlayer: document.getElementById('new-single-player'),
  newMultiplayer: document.getElementById('new-multiplayer'),
  joinMultiplayer: document.getElementById('join-multiplayer'),
  multiplayerGameId: document.getElementById('multiplayer-game-id'),
  music: document.getElementById('music'),
  mute: document.getElementById('mute'),
};

const p1Canvas = document.getElementById('p1-board');

const nextPieceCanvas = document.getElementById('next-piece');

const gameIdSelector = document.getElementById('game-id');

const powerUpContainer = document.getElementById('power-up-container');

const startButton = document.getElementById('start');

const playerContainer = document.getElementById('p1');

const messageContainer = playerContainer.querySelector('.game-message');

const gameSelectors = {
  playerCtx: p1Canvas.getContext('2d'),
  nextCtx: nextPieceCanvas.getContext('2d'),
  opponents: document.getElementById('opponents'),
  score: document.getElementById('game-score'),
  level: document.getElementById('game-level'),
  lines: document.getElementById('game-lines'),
  player: playerContainer,
  message: messageContainer,
  powerUps: [
    document.getElementById('p-up1'),
    document.getElementById('p-up2'),
  ],
  music: menuSelectors.music,
};

module.exports = {
  messageSelector,
  menuSelectors,
  p1Canvas,
  nextPieceCanvas,
  gameIdSelector,
  powerUpContainer,
  startButton,
  gameSelectors,
};
