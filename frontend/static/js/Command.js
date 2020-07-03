class Command {
  constructor(key, callback, toggle=false, delay=0) {
    this.key = key;
    this.callback = callback;
    this.toggle = toggle;
    this.toggleIdx = 0;
    this.startTime;
    this.delay = this.getInitialDelay(delay);
  }

  getInitialDelay(delay) {
    return this.toggle ? this.toggle[this.toggleIdx] : delay;
  }

  execute(time) {
    if(this.startTime === undefined) this.startTime = time;

    if(time >= this.startTime + this.delay) {
      this.callback();
      this.startTime = time;

      if(this.toggle) {
        this.handleToggle();
      } else {
        this.delay = Infinity;
      }
    }
  }

  handleToggle() {
    this.toggleIdx = Math.min(this.toggle.length - 1, this.toggleIdx + 1);
    this.delay = this.toggle[this.toggleIdx];
  }
}

module.exports = Command;