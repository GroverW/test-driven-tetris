const ClientError = require('frontend/static/js/clientError');
const { errorMessage, menuSelectors } = require('frontend/helpers/DOMSelectors');
const { createGame, connectToGame } = require('frontend/helpers/gameFunctions');
const { publish, subscribe } = require('frontend/helpers/pubSub');

const clientError = new ClientError(errorMessage);
const unsubToggleMenu = subscribe('toggleMenu', () => {
  menuSelectors.menuContainer.classList.toggle('hide');
})

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

  if(gameId) {
    connectToGame(gameId);
  } else {
    publish('addError', 'Game ID cannot be blank.');
  }
});

menuSelectors.mute.addEventListener('click', (evt) => {
  const muteBtn =  evt.target;
  evt.preventDefault();
  muteBtn.blur();
  muteBtn.classList.toggle('mute');
  muteBtn.classList.toggle('unmute');
  menuSelectors.music.muted = !menuSelectors.music.muted;
})