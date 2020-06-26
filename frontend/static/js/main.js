const ClientMessage = require('frontend/static/js/ClientMessage');
const { messageSelector, menuSelectors } = require('frontend/helpers/DOMSelectors');
const { createGame, connectToGame } = require('frontend/helpers/gameFunctions');
const { publish, subscribe } = require('frontend/helpers/pubSub');
const { TOGGLE_MENU, ADD_MESSAGE, MSG_TYPE } = require('frontend/helpers/clientTopics');

const clientMessage = new ClientMessage(messageSelector);
const unsubToggleMenu = subscribe(TOGGLE_MENU, () => {
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
    connectToGame(gameId, 'multi');
  } else {
    publish(ADD_MESSAGE, { type: MSG_TYPE.ERROR, message: 'Game ID cannot be blank.' });
  }
});

menuSelectors.mute.addEventListener('click', (evt) => {
  const muteBtn =  evt.target;
  evt.preventDefault();
  muteBtn.blur();

  muteBtn.classList.toggle('muted');
  menuSelectors.music.muted = !menuSelectors.music.muted;
})