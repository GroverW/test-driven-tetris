const {
  BOARD_WIDTH, BOARD_HEIGHT, CELL_COLORS, CELL_SIZE,
} = require('frontend/constants');

/**
 *
 * @param {object} ctx - canvas to draw cell on
 * @param {number} xStart - x-coordinate to begin drawing cell
 * @param {number} yStart - y-coordinate to begin drawing cell
 * @param {number} width - width of cell, in pixels
 * @param {number} height - height of cell, in pixels
 * @param {object} color - object containing color values
 * @param {string} color - object containing color values
 * @param {string} color.highlight - highlight hex color value
 * @param {string} color.lowlight - lowlight hex color value
 * @param {string} color.border - border hex color value
 * @param {string} color.foreground - forground hex color value
 */

const drawCell = (ctx, xStart, yStart, color) => {
  ctx.save();
  const [left, right, top, bottom] = [xStart, xStart + 1, yStart, yStart + 1];

  ctx.fillStyle = color.highlight;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top);
  ctx.fill();
  ctx.clip();

  ctx.fillStyle = color.lowlight;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top);
  ctx.fill();

  ctx.strokeStyle = color.border;
  ctx.strokeRect(left, top, 1, 1);

  ctx.fillStyle = color.foreground;
  const inc = 0.1;
  ctx.fillRect(left + inc, top + inc, 0.8, 0.8);

  ctx.restore();
};

class GameCanvas {
  constructor(ctx, grid, id, cellSize = CELL_SIZE) {
    this.id = id;
    this.grid = grid;
    this.initCtx(ctx, cellSize, grid[0].length, grid.length);
  }

  /**
 * Initializes an HTML canvas
 * @param {object} ctx - context of canvas to initialize
 * @param {number} cellSize - size, in pixels, of one cell on canvas
 * @param {number} [width] - width of canvas, in cells
 * @param {number} [height] - height of canvas, in cells
 */
  initCtx(ctx, cellSize, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    this.ctx = ctx;

    this.scaleBoardSize(cellSize, width, height);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3 / cellSize;
  }

  /**
 * Updatese the scaling of the specified board
 * @param {number} cellSize - size, in pixels, of a single board cell
 * @param {number} [width] - specified width of board, in cells
 * @param {number} [height] - specified height of board, in cells
*/
  scaleBoardSize(cellSize, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    this.ctx.canvas.width = width * cellSize;
    this.ctx.canvas.height = height * cellSize;
    this.ctx.lineWidth = 3 / cellSize;
    this.ctx.scale(cellSize, cellSize);
    this.drawGrid({ grid: this.grid });
  }

  /**
   * Draws a specified grid on a specified canvas
   * @param {number[][]} [grid] - grid to draw
   * @param {number} [brightness] - 0 - 4 levels of brightness
   * @param {number} [x] - x-coordinate to begin drawing grid
   * @param {number} [y] - y-coordinate to being drawing grid
   */
  drawGrid({
    grid,
    brightness = 0,
    x = 0,
    y = 0,
  }) {
    const isBoard = (grid.length === BOARD_HEIGHT);

    grid.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      if (isBoard || cell > 0) {
        drawCell(this.ctx, x + colIdx, y + rowIdx, CELL_COLORS[cell][brightness]);
      }
    }));
  }

  /**
   * Clears board and centers grid to be drawn
   * @param {number[][]} grid - next piece grid
  */
  clearAndDrawCentered(grid) {
    this.ctx.clearRect(0, 0, 4, 4);

    const x = 2 - grid.length / 2;
    const y = grid.length < 4 ? 1 : 0.5;

    this.drawGrid({ grid, x, y });
  }
}

module.exports = GameCanvas;
