const { POINTS, LINES_PER_LEVEL } = require('common/helpers/constants');

/**
 * Represents a Tetris game.
 */
class Game {
  /**
   * Creates a Game.
   * @constructor
   * @param {number} playerId - Id of player linking backend to frontend
   * @param {object} pubSub - Publish / Subscribe object
   * @param {class} Board -  Board class to be instantiated
   */
  constructor(playerId, pubSub, Board) {
    this.playerId = playerId;
    this.gameStatus = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.linesRemaining = 10;
    this.pubSub = pubSub;
    this.board = new Board(pubSub, playerId);
    this.subscriptions = [
      this.pubSub.subscribe('lowerPiece', this.updateScore.bind(this)),
      this.pubSub.subscribe('clearLines', this.clearLines.bind(this)),
      this.pubSub.subscribe('gameOver', this.gameOver.bind(this)),
    ]
  }

  /**
   * Starts the game
   */
  start() {
    if(this.gameStatus || this.gameStatus === null) return false;
    
    this.board.getPieces();
    this.gameStatus = true;
    return true;
  }

  /**
   * Executes commands.
   */
  command() {
    // implemented individually
  }

  /**
   * Updates game score.
   * @param {number} points - number of points to add to game score
   */
  updateScore(points) {
    this.score += points;
  }

  /**
   * Updates level, and number of lines remaining until next level.
   * @param {number} lines - number of lines cleared
   */
  updateLinesRemaining(lines) {
    this.lines += lines;

    if(this.linesRemaining <= lines) this.level++

    this.linesRemaining = LINES_PER_LEVEL - this.lines % LINES_PER_LEVEL;
  }

  /**
   * Updates score and lines remaining based on number of lines cleared
   * @param {number} lines - number of lines cleared
   */
  clearLines(lines) {
    if(POINTS.LINES_CLEARED[lines]) {
      this.updateScore(POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLinesRemaining(lines);
    }
  }

  /**
   * Ends the current game.
   */
  gameOver() {
    // implemented individually
  }
}

module.exports = Game;