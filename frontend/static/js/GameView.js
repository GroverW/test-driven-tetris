const { subscribe } = require('frontend/helpers/pubSub');
const {
  CELL_COLORS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_SIZE
} = require('frontend/helpers/clientConstants');
const {
  DRAW,
  REMOVE_PLAYER,
  UPDATE_PLAYER,
} = require('frontend/helpers/clientTopics');


/**
 * Represents a client-side HTML canvas manager
 */
class GameView {
  /**
   * @constructor
   * @param {object} ctx - player canvas context
   * @param {object} ctxNext - next piece canvas context
   */
  constructor(ctx, ctxNext) {
    this.ctx = this.initCtx(ctx, CELL_SIZE);
    this.ctxNext = this.initCtx(ctxNext, CELL_SIZE, 4, 4);
    this.subscriptions = [
      subscribe(DRAW, this.draw.bind(this)),
      subscribe(REMOVE_PLAYER, this.removePlayer.bind(this)),
      subscribe(UPDATE_PLAYER, this.updatePlayer.bind(this)),
    ];
    this.players = [];
  }

  /**
   * Initializes an HTML canvas
   * @param {object} ctx - context of canvas to initialize
   * @param {number} cellSize - size, in pixels, of one cell on canvas 
   * @param {number} width - width of canvas, in cells
   * @param {number} height - height of canvas, in cells
   */
  initCtx(ctx, cellSize, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    this.scaleBoardSize(ctx, cellSize, width, height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3 / cellSize;

    return ctx;
  }

  /**
   * Draws the specified board, piece, or nextPiece on the canvas
   * @param {array} [board] - board to draw
   * @param {object} [piece] - piece to draw
   * @param {array} [piece.grid] - piece grid to draw
   * @param {number} [piece.x] - x-coordinate to start drawing piece
   * @param {number} [piece.y] - y-coordinate to start drawing piece
   * @param {object} [nextPiece] - nextPiece to draw
   * @param {array} [nextPiece.grid] - nextPiece grid to draw
   */
  draw({ board, piece, nextPiece }) {
    if (board) this.drawGrid(this.ctx, board);
    if (piece) this.drawGrid(this.ctx, piece.grid, piece.x, piece.y, false);
    if (nextPiece) this.drawNext(this.ctxNext, nextPiece.grid);
  }
 
  /**
   * Draws a specified grid on a specified canvas
   * @param {object} ctx - canvas to draw grid on
   * @param {array} grid - grid to draw
   * @param {number} xStart - x-coordinate to begin drawing grid
   * @param {number} yStart - y-coordinate to being drawing grid
   * @param {boolean} isBoard - whether or not drawing board
   */
  drawGrid(ctx, grid, xStart=0, yStart=0, isBoard=true) {
    grid.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) => {
        if (isBoard || cell > 0) {
          this.drawCell(ctx, xStart + colIdx, yStart + rowIdx, 1, 1, CELL_COLORS[cell])
        }
      })
    );
  }

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
  drawCell(ctx, xStart, yStart, width, height, color) {
    ctx.save();

    ctx.fillStyle = color.highlight;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart)
    ctx.lineTo(xStart, yStart + height)
    ctx.lineTo(xStart + width, yStart + height)
    ctx.lineTo(xStart + width, yStart)
    ctx.fill();
    ctx.clip();

    ctx.fillStyle = color.lowlight;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart + height)
    ctx.lineTo(xStart + width, yStart + height)
    ctx.lineTo(xStart + width, yStart)
    ctx.fill();

    ctx.strokeStyle = color.border;
    ctx.strokeRect(xStart, yStart, width, height);

    ctx.fillStyle = color.foreground;
    const inc = .1;
    ctx.fillRect(xStart + inc, yStart + inc, .8, .8);

    ctx.restore();
  }

  /**
   * Draws the next piece
   * @param {object} ctx - canvas to draw the next piece
   * @param {array} grid - next piece grid
   */
  drawNext(ctx, grid) {
    ctx.clearRect(0, 0, 4, 4);

    const xStart = 2 - grid.length / 2;
    const yStart = grid.length < 4 ? 1 : .5;

    this.drawGrid(ctx, grid, xStart, yStart, false);
  }

  /**
   * Updatese the scaling of the specified board
   * @param {object} ctx - canvas of the specified board to scale
   * @param {number} cellSize - size, in pixels, of a single board cell
   * @param {number} width - specified width of board, in cells
   * @param {number} height - specified height of board, in cells
   */
  scaleBoardSize(ctx, cellSize, width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    ctx.canvas.width = width * cellSize;
    ctx.canvas.height = height * cellSize;
    ctx.lineWidth = 3 / cellSize;
    ctx.scale(cellSize, cellSize)
  }

  /**
   * Adds an additional player to the player list
   * @param {object} player - player to add
   * @param {object} player.ctx - canvas context of player to add
   * @param {number} player.id - id of player to add
   * @param {array} player.board - board of player to add
   */
  addPlayer(player) {
    let cellSize = CELL_SIZE;

    if (this.players.length >= 1) {
      cellSize /= 2;
      this.scaleBoardSize(this.players[0].ctx, cellSize);
      this.drawGrid(this.players[0].ctx, this.players[0].board);
    }

    this.players.push(player)

    this.initCtx(player.ctx, cellSize);
    this.drawGrid(player.ctx, player.board);
  }

  /**
   * Removes a player from the player list
   * @param {number} id - id of player to remove
   */
  removePlayer(id) {
    const playerIdx = this.players.findIndex((p) => p.id === id);
    if (playerIdx > -1) this.players.splice(playerIdx, 1);

    if (this.players.length === 1) {
      this.scaleBoardSize(this.players[0].ctx, CELL_SIZE);
      this.drawGrid(this.players[0].ctx, this.players[0].board);
    }
  }

  /**
   * Updates a player's board
   * @param {number} id - id of player to update
   * @param {array} board - board of player to update
   */
  updatePlayer({ id, board }) {
    const player = this.players.find((p) => p.id === id);

    if (player) {
      player.board = board;
      this.drawGrid(player.ctx, player.board);
    }
  }

  /**
   * Unsubscribes gameView from all topics
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

module.exports = GameView;