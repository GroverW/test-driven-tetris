const clientMessage = require('frontend/static/js/ClientMessage');
const { messageSelector, menuSelectors } = require('frontend/helpers/DOMSelectors');
const { createGame, joinGame } = require('frontend/helpers/gameFunctions');
const { subscribe } = require('frontend/helpers/pubSub');
const { TOGGLE_MENU } = require('frontend/helpers/clientTopics');
const { publishError } = require('frontend/helpers/clientUtils');

clientMessage.initialize(messageSelector);
subscribe(TOGGLE_MENU, () => {
  menuSelectors.menuContainer.classList.toggle('hide');
});

// start a new single player game
menuSelectors.newSinglePlayer.addEventListener('click', (evt) => {
  evt.target.blur();
  createGame('single');
});

// start a new multiplayer game
menuSelectors.newMultiplayer.addEventListener('click', (evt) => {
  evt.target.blur();
  createGame('multi');
});

// join a multiplayer game
menuSelectors.joinMultiplayer.addEventListener('submit', (evt) => {
  evt.preventDefault();
  evt.target.blur();

  const gameId = menuSelectors.multiplayerGameId.value;

  if (gameId) {
    joinGame(gameId);
  } else {
    publishError('Game ID cannot be blank.');
  }
});

menuSelectors.mute.addEventListener('click', (evt) => {
  const muteBtn = evt.target;
  evt.preventDefault();
  muteBtn.blur();

  muteBtn.classList.toggle('muted');
  menuSelectors.music.muted = !menuSelectors.music.muted;
});
