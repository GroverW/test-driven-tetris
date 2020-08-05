const commonUtils = require('common/helpers/utils');
const { RANKINGS } = require('backend/constants');

const multiPlayerGameOverMessage = (ranking) => ({
  header: `${RANKINGS[ranking]} Place!`,
  body: [],
});

const singlePlayerGameOverMessage = (player) => ({
  header: 'Game Over!',
  body: [
    `Final Score: ${player.game.score}`,
    `Level: ${player.game.level}`,
    `Lines Cleared: ${player.game.lines}`,
  ],
});

module.exports = {
  ...commonUtils,
  multiPlayerGameOverMessage,
  singlePlayerGameOverMessage,
};
