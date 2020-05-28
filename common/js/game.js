const { POINTS, LINES_PER_LEVEL } = require('../helpers/constants');

class Game {
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

  start() {
    if(this.gameStatus || this.gameStatus === null) return false;
    
    this.board.getPieces();
    this.gameStatus = true;
    return true;
  }

  command() {
    // implemented individually
  }

    /**
   * SCOREBOARD
   * 
   * updateScore
   * - adds points to score, publishes score
   * 
   * updateLines
   * - updates level
   * - adds lines lines to lines cleared
   * - publishes lines and level
   * 
   * clearLines
   * - calls updateScore and updateLines when clearLines is published
   */
  updateScore(points) {
    this.score += points;
  }

  updateLines(lines) {
    this.lines += lines;

    if(this.linesRemaining <= lines) this.level++

    this.linesRemaining = LINES_PER_LEVEL - this.lines % LINES_PER_LEVEL;
  }

  clearLines(lines) {
    if(POINTS.LINES_CLEARED[lines]) {
      this.updateScore(POINTS.LINES_CLEARED[lines] * this.level);
      this.updateLines(lines);
    }
  }

  gameOver() {
    // implemented individually
  }
}

module.exports = Game;