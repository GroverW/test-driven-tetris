class GameLoop {
  constructor() {
    this.command;
    this.autoCommand;
    this.animationId;
  }

  setCommand(command) {
    if (this.command === undefined || this.command.key !== command.key) {
      this.command = command;
    }
  }

  setAutoCommand(command) {
    this.autoCommand = command;
  }

  clearCommand(key) {
    if (this.command !== undefined && key === this.command.key) {
      this.command = undefined;
    }
  }

  animate(currTime = 0) {
    if (this.command !== undefined) this.command.execute(currTime);
    if (this.autoCommand !== undefined) this.autoCommand.execute(currTime);

    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }
}

module.exports = GameLoop;