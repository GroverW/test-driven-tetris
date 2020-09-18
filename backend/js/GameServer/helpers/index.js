const { GAME_TYPES } = require('backend/constants');

const isValidGameType = (gameType) => Object.values(GAME_TYPES).includes(gameType);

module.exports = {
  isValidGameType,
};
