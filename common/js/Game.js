const SubscriberBase = require('common/js/SubscriberBase');

const { POINTS, LINES_PER_LEVEL } = require('common/helpers/constants');
const { LOWER_PIECE, CLEAR_LINES, ADD_PIECES } = require('common/helpers/commonTopics');

/**
 * Represents a Tetris game.
 */
class Game extends SubscriberBase {
  /**
   * Creates a Game.
   * @constructor
   * @param {number} playerId - Id of player linking backend to frontend
   * @param {object} pubSub - Publish / Subscribe object
   * @param {class} Board -  Board class to be instantiated
   */
  constructor(playerId, pubSub, Board) {
    super(pubSub);
    super.initialize(playerId);
    this.gameStatus = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.board = new Board(pubSub, playerId);
    this.mapSubscriptions([LOWER_PIECE, CLEAR_LINES, ADD_PIECES]);
  }

  /**
   * Starts the game
   */
  start() {
    if (this.gameStatus || this.gameStatus === null) return false;

    this.board.getPieces();
    this.gameStatus = true;
    return true;
  }

  /**
   * Adds new list of pieces to current set
   * @param {number[]} pieces - list of piece ids
   */
  [ADD_PIECES](pieces) {
    this.board.pieceList.addSet(pieces);
  }

  /**
   * Updates game score.
   * @param {number} points - number of points to add to game score
   */
  [LOWER_PIECE](points) {
    this.score += points;
  }

  /**
   * Updates level, and number of lines remaining until next level.
   * @param {number} lines - number of lines cleared
   */
  updateLinesRemaining(lines) {
    this.lines += lines;

    if (this.linesRemaining <= lines) this.level += 1;

    this.linesRemaining = LINES_PER_LEVEL - (this.lines % LINES_PER_LEVEL);
  }

  /**
   * Updates score and lines remaining based on number of lines cleared
   * @param {number} lines - number of lines cleared
   */
  [CLEAR_LINES](lines) {
    if (POINTS.LINES_CLEARED[lines]) {
      this[LOWER_PIECE](POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLinesRemaining(lines);
    }
  }

  endGameAction() {
    this.unsubscribe();
  }
}

module.exports = Game;
