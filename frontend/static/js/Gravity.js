const {
  ANIMATION_SPEED,
  MAX_SPEED,
} = require('frontend/helpers/clientConstants');
const {
  UPDATE_SCORE,
  ADD_LOCK_DELAY,
  INTERRUPT_DELAY,
  GAME_OVER,
} = require('frontend/helpers/clientTopics');
const { subscribe } = require('frontend/helpers/pubSub');


class Gravity {
  constructor(playerId, lowerPiece, validNextMove) {
    this.playerId = playerId;
    this.level = 1;
    this.start = 0;
    this.interrupt = false;
    this.lockDelay = 0;
    this.lowerPiece = lowerPiece;
    this.isValidNextMove = true;
    this.checkValidNextMove = validNextMove;
    this.subscriptions = [
      subscribe(UPDATE_SCORE, this.updateLevel.bind(this)),
      subscribe(ADD_LOCK_DELAY, this.incrementLockDelay.bind(this)),
      subscribe(INTERRUPT_DELAY, this.interruptDelay.bind(this)),
      subscribe(GAME_OVER, this.gameOver.bind(this)),
    ];
  }

  get delay() {
    const lockDelay = this.isValidNextMove ? 0 : this.lockDelay;
    return this.getAnimationDelay() + lockDelay;
  }

  updateLevel({ level }) {
    if(level !== undefined) this.level = level;
  }

  getAnimationDelay() {
    return ANIMATION_SPEED[Math.min(this.level, MAX_SPEED)];
  }

  interruptDelay() {
    this.interrupt = true;
  }

  incrementLockDelay() {
    const increment = this.getLockDelayIncrement();
    this.lockDelay = Math.min(increment * 4, this.lockDelay + increment);
  }

  getLockDelayIncrement() {
    const baseDelay = ANIMATION_SPEED[1];
    const currentDelay = this.delay;

    // max is baseDelay / 4, min is baseDelay / 8
    return ((baseDelay / currentDelay - 1) / 2 + 1) * currentDelay / 4;
  }

  execute(currTime) {
    this.isValidNextMove = this.checkValidNextMove();

    if(this.isValidNextMove && this.interrupt) {
      this.start = currTime;
      this.interrupt = false;
    }

    if(currTime >= this.start + this.delay) {
      this.start = currTime;
      this.lowerPiece();
      this.lockDelay = 0;
    }
  }

  gameOver({ id }) {
    if(id === this.playerId) this.unsubscribe();
  }

  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }
}

module.exports = Gravity;