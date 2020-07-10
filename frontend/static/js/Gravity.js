const SubscriberBase = require('common/js/SubscriberBase');

const pubSub = require('frontend/helpers/pubSub');

const { ANIMATION_SPEED, MAX_SPEED } = require('frontend/helpers/clientConstants');
const { UPDATE_SCORE, ADD_LOCK_DELAY, INTERRUPT_DELAY } = require('frontend/helpers/clientTopics');


/**
 * Represents in-game gravity. Automatically moves the current piece downwards.
 */
class Gravity extends SubscriberBase {
  /**
   * Creates a Gravity object
   * @constructor
   * @param {number} playerId - Links client to backend Game
   * @param {callback} lowerPiece - executes lowering the piece
   * @param {callback} validNextMove - checks whether the next move is valid
   */
  constructor(playerId, lowerPiece, validNextMove) {
    super(playerId, pubSub);
    this.level = 1;
    this.start = 0;
    this.interrupt = false;
    this.lowerPiece = lowerPiece;
    this.isValidNextMove = true;
    this.checkValidNextMove = validNextMove;
    this.resetLockDelay();
    this.mapSubscriptions([UPDATE_SCORE, ADD_LOCK_DELAY, INTERRUPT_DELAY]);
  }

  /**
   * Gets the total delay in ms until the piece is lowered
   * Comprised of - base delay + lock delay
   * @returns {number} - delay in ms
   */
  get delay() {
    const lockDelay = this.isValidNextMove ? 0 : this.lockDelay;
    return this.getAnimationDelay() + lockDelay;
  }

  /**
   * Updates the game level, which is used to determine delay time
   * @param {number} level - current game level
   */
  [UPDATE_SCORE]({ level }) {
    if(level !== undefined) this.level = level;
  }

  /**
   * Gets the base animation delay in ms until the piece is lowered
   * @returns {number} - delay in ms
   */
  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }

  /**
   * Sets the interrupt flag to reset the delay timer
   */
  [INTERRUPT_DELAY]() {
    this.interrupt = true;
  }

  /**
   * Increments lock delay
   */
  [ADD_LOCK_DELAY]() {
    const increment = this.getLockDelayIncrement();
    this.lockDelay = Math.min(increment * 5, this.lockDelay + increment);
  }

  /**
   * Calculates one increment of lock delay
   * @returns {number} - delay in ms
   */
  getLockDelayIncrement() {
    const baseDelay = ANIMATION_SPEED[1];
    const currentDelay = this.delay;

    // max is baseDelay / 4, min is baseDelay / 8
    return ((baseDelay / currentDelay - 1) / 2 + 1) * currentDelay / 4;
  }

  /**
   * Resets the current lock delay
   */
  resetLockDelay() {
    this.lockDelay = this.getLockDelayIncrement();
  }

  /**
   * Handles execution of lowering piece and resetting timers
   * @param {number} currTime - current game time in ms
   */
  execute(currTime) {
    this.isValidNextMove = this.checkValidNextMove();
    
    if(this.isValidNextMove && this.interrupt) {
      this.start = currTime;
      this.interrupt = false;
    }

    if(currTime >= this.start + this.delay) {
      this.start = currTime;
      this.lowerPiece();
      this.resetLockDelay();
    }
  }

  /**
   * Unsubscribes from all messages if player linked to Gravity loses
   */
  gameOverAction() {
    this.unsubscribe();
  }
}

module.exports = Gravity;