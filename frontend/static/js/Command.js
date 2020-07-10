const { publish } = require('frontend/helpers/pubSub');
const { ADD_TO_QUEUE } = require('frontend/helpers/clientTopics');


/**
 * Represents a game command
 */
class Command {
  /**
   * Creates a Command
   * @constructor
   * @param {number|string} key - keypress identifying command
   * @param {function} callback - executes the command
   * @param {number[]} [delay] - list of delay timings in ms
   */
  constructor(key, callback, delay=[0]) {
    this.key = key;
    this.type = (delay.length > 1) ? 'toggleCommand' : 'command';
    this.callback = callback;
    this.startTime;
    this._delayIdx = 0;
    this._delay = delay;
  }

  /**
   * Gets the current delay in ms
   * @returns {number} - current delay in ms
   */
  get delay() {
    return this._delay[this._delayIdx];
  }

  /**
   * Handles execution of callback and resetting timers
   * @param {number} currTime - current game time in ms
   */
  execute(currTime) {
    if(this.startTime === undefined) this.startTime = currTime;

    if(currTime >= this.startTime + this.delay) {
      publish(ADD_TO_QUEUE, this.key);
      this.callback();
      this.startTime = currTime;

      this.updateDelay();
    }
  }

  /**
   * Iterates through delay list
   */
  updateDelay() {
    if(this.type === 'toggleCommand') {
      this._delayIdx = Math.min(this._delay.length - 1, this._delayIdx + 1);
    } else {
      this._delay[this._delayIdx] = Infinity;
    }
  }
}

module.exports = Command;