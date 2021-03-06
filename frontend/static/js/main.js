const clientMessage = require('frontend/static/js/ClientMessage');
const { messageSelector, menuSelectors } = require('frontend/helpers/DOMSelectors');
const { createGame, joinGame } = require('frontend/helpers/gameFunctions');
const { subscribe } = require('frontend/helpers/pubSub');
const { TOGGLE_MENU } = require('frontend/topics');
const { publishError } = require('frontend/helpers/utils');

const {
  menuContainer, newSinglePlayer, newMultiplayer, joinMultiplayer, multiplayerGameId, mute, music,
} = menuSelectors;

clientMessage.initialize(messageSelector);
subscribe(TOGGLE_MENU, () => {
  menuContainer.classList.toggle('hide');
});

const handleNewGame = (type) => (evt) => {
  evt.target.blur();
  createGame(type);
};

const handleJoinMultiplayer = (evt) => {
  evt.preventDefault();
  evt.target.blur();

  const gameId = multiplayerGameId.value;

  if (gameId) {
    joinGame(gameId);
  } else {
    publishError('Game ID cannot be blank.');
  }
};

const handleMute = (evt) => {
  const muteBtn = evt.target;
  evt.preventDefault();
  muteBtn.blur();

  muteBtn.classList.toggle('muted');
  music.muted = !music.muted;

  localStorage.setItem('muted', JSON.parse(music.muted));
};

(() => {
  const defaultMute = JSON.parse(localStorage.getItem('muted'));

  if (defaultMute) {
    music.muted = true;
    mute.classList.add('muted');
  }
})();

newSinglePlayer.addEventListener('click', handleNewGame('single'));
newMultiplayer.addEventListener('click', handleNewGame('multi'));
joinMultiplayer.addEventListener('submit', handleJoinMultiplayer);
mute.addEventListener('click', handleMute);
