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
   * @param {boolean|number[]} [toggle] - list of delay timings in ms
   * @param {number} [delay] - delay in ms
   */
  constructor(key, callback, toggle=false, delay=0) {
    this.key = key;
    this.type = toggle ? 'toggleCommand' : 'command';
    this.callback = callback;
    this.toggle = toggle;
    this.toggleIdx = 0;
    this.startTime;
    this.delay = this.getInitialDelay(delay);
  }

  /**
   * Gets the initial delay in ms
   * @param {number} delay - delay in ms
   * @returns {number} - initial delay
   */
  getInitialDelay(delay) {
    return this.toggle ? this.toggle[this.toggleIdx] : delay;
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

      if(this.toggle) {
        this.handleToggle();
      } else {
        this.delay = Infinity;
      }
    }
  }

  /**
   * Increments toggle index and updates delay
   */
  handleToggle() {
    this.toggleIdx = Math.min(this.toggle.length - 1, this.toggleIdx + 1);
    this.delay = this.toggle[this.toggleIdx];
  }
}

module.exports = Command;