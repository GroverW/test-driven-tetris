const { subscribe } = require('frontend/helpers/pubSub');
const { CELL_COLORS, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } = require('frontend/helpers/clientConstants');


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
      subscribe('draw', this.draw.bind(this)),
      subscribe('removePlayer', this.removePlayer.bind(this)),
      subscribe('updatePlayerBoard', this.updatePlayer.bind(this)),
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
   * @param {object} data - data to draw
   * @param {array} [data.board] - board to draw
   * @param {object} [data.piece] - piece to draw
   * @param {array} [data.piece.grid] - piece grid to draw
   * @param {number} [data.piece.x] - x-coordinate to start drawing piece
   * @param {number} [data.piece.y] - y-coordinate to start drawing piece
   * @param {object} [data.nextPiece] - nextPiece to draw
   * @param {array} [data.nextPiece.grid] - nextPiece grid to draw
   */
  draw(data) {
    if (data.board) this.drawBoard(this.ctx, data.board);
    if (data.piece) this.drawPiece(this.ctx, data.piece, data.piece.x, data.piece.y);
    if (data.nextPiece) this.drawNext(this.ctxNext, data.nextPiece);
  }

  /**
   * Draws a specified board on a specified canvas
   * @param {object} ctx - canvas to draw board on
   * @param {array} board - board grid
   */
  drawBoard(ctx, board) {
    board.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) => {
        this.drawCell(ctx, colIdx, rowIdx, 1, 1, CELL_COLORS[cell])
      })
    );
  }

  /**
   * Draws a specified piece on a specified canvas
   * @param {object} ctx - canvas to draw piece on
   * @param {array} piece - piece grid
   * @param {number} xStart - x-coordinate to begin drawing piece
   * @param {number} yStart - y-coordinate to being drawing piece
   */
  drawPiece(ctx, piece, xStart, yStart) {
    piece.grid.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) => {
        if (cell > 0) {
          this.drawCell(ctx, xStart + colIdx, yStart + rowIdx, 1, 1, CELL_COLORS[cell])
        }
      })
    );
  }

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
    ctx.moveTo(xStart, yStart)
    ctx.lineTo(xStart, yStart + height)
    ctx.lineTo(xStart + width, yStart + height)
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
   * @param {object} piece - next piece
   * @param {array} piece.grid - next piece grid
   */
  drawNext(ctx, piece) {
    ctx.clearRect(0, 0, 4, 4);

    const xStart = 2 - piece.grid.length / 2;
    const yStart = piece.grid.length < 4 ? 1 : .5;

    this.drawPiece(ctx, piece, xStart, yStart)
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
      this.drawBoard(this.players[0].ctx, this.players[0].board);
    }

    this.players.push(player)

    this.initCtx(player.ctx, cellSize);
    this.drawBoard(player.ctx, player.board);
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
      this.drawBoard(this.players[0].ctx, this.players[0].board);
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
      this.drawBoard(player.ctx, player.board);
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