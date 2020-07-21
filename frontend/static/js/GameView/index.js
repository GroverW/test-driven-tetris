const SubscriberBase = require('common/js/SubscriberBase');

const pubSub = require('frontend/helpers/pubSub');

const { CELL_SIZE } = require('frontend/helpers/clientConstants');
const { DRAW, REMOVE_PLAYER, UPDATE_PLAYER } = require('frontend/helpers/clientTopics');

const GameCanvas = require('./GameCanvas');
/**
 * Represents a client-side HTML canvas manager
 */
class GameView extends SubscriberBase {
  /**
   * @constructor
   * @param {object} ctx - player canvas context
   * @param {number[][]} board - player initial board
   * @param {object} ctxNext - next piece canvas context
   * @param {number[][]} nextPieceBoard - initial next piece board
   */
  constructor(ctx, board, ctxNext, nextPieceBoard) {
    super(pubSub, null);
    this.player = new GameCanvas(ctx, board, null);
    this.nextPiece = new GameCanvas(ctxNext, nextPieceBoard, null);
    this.mapSubscriptions([DRAW, REMOVE_PLAYER, UPDATE_PLAYER]);
    this.players = [];
  }

  /**
   * Draws the specified board, piece, or nextPiece on the canvas
   * @param {number[][]} [board] - board to draw
   * @param {object} [piece] - piece to draw
   * @param {number[][]} [piece.grid] - piece grid to draw
   * @param {number} [piece.x] - x-coordinate to start drawing piece
   * @param {number} [piece.y] - y-coordinate to start drawing piece
   * @param {object} [nextPiece] - nextPiece to draw
   * @param {number[][]} [nextPiece.grid] - nextPiece grid to draw
   */
  [DRAW]({ board, piece, nextPiece }) {
    if (board) this.player.drawGrid(board);
    if (piece) this.player.drawGrid(piece.grid, undefined, piece.x, piece.y);
    if (nextPiece) this.nextPiece.clearAndDrawCentered(nextPiece.grid);
  }

  /**
   * Adds an additional player to the player list
   * @param {object} ctx - canvas context of player to add
   * @param {number[][]} board - board of player to add
   * @param {number} id - id of player to add
   */
  addPlayer({ ctx, board, id }) {
    let cellSize = CELL_SIZE;

    if (this.players.length >= 1) {
      cellSize /= 2;
      const player2 = this.players[0];
      player2.scaleBoardSize(cellSize);
    }

    const newPlayer = new GameCanvas(ctx, board, id, cellSize);

    this.players.push(newPlayer);
  }

  /**
   * Removes a player from the player list
   * @param {number} id - id of player to remove
   */
  [REMOVE_PLAYER](id) {
    this.players = this.players.filter((p) => p.id !== id);

    if (this.players.length === 1) {
      const player2 = this.players[0];
      player2.scaleBoardSize(CELL_SIZE);
    }
  }

  /**
   * Updates a player's board
   * @param {number} id - id of player to update
   * @param {number[][]} board - board of player to update
   */
  [UPDATE_PLAYER]({ id, board }) {
    const player = this.players.find((p) => p.id === id);

    if (player) {
      player.board = board;
      player.drawGrid();
    }
  }

  endGameAction() {
    this.unsubscribe();
  }
}

module.exports = GameView;
