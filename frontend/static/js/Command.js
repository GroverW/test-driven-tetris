class Command {
  constructor(key, callback, delay=0, toggle=false) {
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

      if(this.toggle) {
        this.handleToggle();
        return true;
      } else {
        return false;
      }
    }

    return true;
  }

  handleToggle() {
    this.toggleIdx = Math.min(this.toggle.length - 1, this.toggleIdx + 1);
    this.delay = this.toggle[this.toggleIdx];
  }
}

module.exports = Command;