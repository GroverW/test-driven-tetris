class GameLoop {
  constructor() {
    this.command;
    this.autoCommand;
    this.animationId;
  }

  setCommand(command) {
    this.command = command;
  }

  setAutoCommand(command) {
    this.autoCommand = command;
  }

  animate(currTime = 0) {
    if(this.command) this.command(currTime);
    if(this.autoCommand) this.autoCommand(currTime);

    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }
}

module.exports = GameLoop;