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
  constructor(key, callback, delay = [0]) {
    this.key = key;
    this.type = (delay.length > 1) ? 'toggleCommand' : 'command';
    this.callback = callback;
    this.delayIdx = 0;
    this.delayList = delay;
  }

  /**
   * Gets the current delay in ms
   * @returns {number}
   */
  get delay() {
    return this.delayList[this.delayIdx];
  }

  /**
   * Handles execution of callback and resetting timers
   * @param {number} currTime - current game time in ms
   */
  execute(currTime) {
    if (this.startTime === undefined) this.startTime = currTime;

    if (currTime >= this.startTime + this.delay) {
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
    if (this.type === 'toggleCommand') {
      this.delayIdx = Math.min(this.delayList.length - 1, this.delayIdx + 1);
    } else {
      this.delayList[this.delayIdx] = Infinity;
    }
  }
}

module.exports = Command;
