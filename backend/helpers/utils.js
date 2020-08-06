const commonUtils = require('common/helpers/utils');
const { RANKINGS } = require('backend/constants');

const gameOverMessge = (header, ...body) => ({ header, body });

const multiPlayerGameOverMessage = (ranking) => gameOverMessge(
  `${RANKINGS[ranking]} Place!`,
  '',
);

const singlePlayerGameOverMessage = (player) => gameOverMessge(
  'Game Over!',
  `Final Score: ${player.game.score}`,
  `Level: ${player.game.level}`,
  `Lines Cleared: ${player.game.lines}`,
);

module.exports = {
  ...commonUtils,
  multiPlayerGameOverMessage,
  singlePlayerGameOverMessage,
};
