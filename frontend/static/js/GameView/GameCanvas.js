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

const drawCell = (ctx, xStart, yStart, width, height, color) => {
  ctx.save();

  ctx.fillStyle = color.highlight;
  ctx.beginPath();
  ctx.moveTo(xStart, yStart);
  ctx.lineTo(xStart, yStart + height);
  ctx.lineTo(xStart + width, yStart + height);
  ctx.lineTo(xStart + width, yStart);
  ctx.fill();
  ctx.clip();

  ctx.fillStyle = color.lowlight;
  ctx.beginPath();
  ctx.moveTo(xStart, yStart + height);
  ctx.lineTo(xStart + width, yStart + height);
  ctx.lineTo(xStart + width, yStart);
  ctx.fill();

  ctx.strokeStyle = color.border;
  ctx.strokeRect(xStart, yStart, width, height);

  ctx.fillStyle = color.foreground;
  const inc = 0.1;
  ctx.fillRect(xStart + inc, yStart + inc, 0.8, 0.8);

  ctx.restore();
};

class GameCanvas {
  constructor(ctx, board, id, cellSize = CELL_SIZE) {
    this.id = id;
    this.board = board;
    this.ctx = this.initCtx(ctx, cellSize, board[0].length, board.length);
  }

  /**
 * Initializes an HTML canvas
 * @param {object} ctx - context of canvas to initialize
 * @param {number} cellSize - size, in pixels, of one cell on canvas
 * @param {number} [width] - width of canvas, in cells
 * @param {number} [height] - height of canvas, in cells
 */
  initCtx(ctx, cellSize, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    const newCtx = ctx;

    this.scaleBoardSize(cellSize, newCtx, width, height);
    newCtx.strokeStyle = '#000000';
    newCtx.lineWidth = 3 / cellSize;

    return newCtx;
  }

  /**
 * Updatese the scaling of the specified board
 * @param {number} cellSize - size, in pixels, of a single board cell
 * @param {object} [ctx] - canvas of the specified board to scale
 * @param {number} [width] - specified width of board, in cells
 * @param {number} [height] - specified height of board, in cells
*/
  scaleBoardSize(cellSize, ctx = this.ctx, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    ctx.canvas.width = width * cellSize;
    ctx.canvas.height = height * cellSize;
    ctx.lineWidth = 3 / cellSize;
    ctx.scale(cellSize, cellSize);
    this.drawGrid(this.board, ctx);
  }

  /**
   * Draws a specified grid on a specified canvas
   * @param {number[][]} [grid] - grid to draw
   * @param {object} [ctx] - canvas of specified grid
   * @param {number} xStart - x-coordinate to begin drawing grid
   * @param {number} yStart - y-coordinate to being drawing grid
   */
  drawGrid(grid = this.board, ctx = this.ctx, xStart = 0, yStart = 0) {
    const isBoard = (grid.length === BOARD_HEIGHT);

    grid.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      if (isBoard || cell > 0) {
        drawCell(ctx, xStart + colIdx, yStart + rowIdx, 1, 1, CELL_COLORS[cell]);
      }
    }));
  }

  /**
   * Clears board and centers grid to be drawn
   * @param {number[][]} grid - next piece grid
  */
  clearAndDrawCentered(grid) {
    this.ctx.clearRect(0, 0, 4, 4);

    const xStart = 2 - grid.length / 2;
    const yStart = grid.length < 4 ? 1 : 0.5;

    this.drawGrid(grid, this.ctx, xStart, yStart);
  }
}

module.exports = GameCanvas;
