const { menuSelectors } = require('frontend/helpers/DOMSelectors');
const { createGame, connectToGame } = require('frontend/helpers/gameFunctions');

// start a new single player game
menuSelectors.newSinglePlayer.addEventListener('click', event => {
  event.target.blur();
  menuSelectors.menuContainer.classList.toggle('hide');
  createGame('single');
});

// start a new multiplayer game
menuSelectors.newMultiplayer.addEventListener('click', event => {
  event.target.blur();
  menuSelectors.menuContainer.classList.toggle('hide');
  createGame('multi');
});

// join a multiplayer game
menuSelectors.joinMultiplayer.addEventListener('submit', event => {
  event.preventDefault();
  event.target.blur();
  
  menuSelectors.menuContainer.classList.toggle('hide');
  
  const gameId = menuSelectors.multiplayerGameId.value;
  connectToGame(gameId);
});

menuSelectors.mute.addEventListener('click', event => {
  const muteBtn =  event.target;
  event.preventDefault();
  muteBtn.blur();
  muteBtn.classList.toggle('mute');
  muteBtn.classList.toggle('unmute');
  menuSelectors.music.muted = !menuSelectors.music.muted;
})