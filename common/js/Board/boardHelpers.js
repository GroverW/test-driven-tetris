const { BOARD_HEIGHT } = require('common/helpers/constants');

/**
 * Gets first non empty space on grid within specified columns
 * @param {number} xStart - left column bound
 * @param {number} xEnd - right column bound
 * @param {number[][]} grid - grid to scan
 */
const getMaxGridHeight = (xStart, xEnd, grid) => {
  const maxHeight = grid.findIndex((row) => (
    row.some((val, col) => (val > 0 && col >= xStart && col <= xEnd))
  ));

  return maxHeight >= 0 ? maxHeight : BOARD_HEIGHT;
};

module.exports = {
  getMaxGridHeight,
};
