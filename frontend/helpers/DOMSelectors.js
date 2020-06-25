const messageSelector = document.getElementById('flash-message');

const menuSelectors = {
  menuContainer: document.getElementById('menu'),
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
    document.getElementById('p-up1'),
    document.getElementById('p-up2')
  ],
  music: menuSelectors.music,
};

/**
 * Adds game id to stats container for sharing
 * @param {string} id - game id
 */
const addGameIdToStats = (id) => {
  gameIdSelector.innerText = id;
}

module.exports = {
  messageSelector,
  menuSelectors,
  p1Canvas,
  nextPieceCanvas,
  gameIdSelector,
  startButton,
  gameSelectors,
  addGameIdToStats,
};