const { subscribe } = require('frontend/helpers/pubSub');
const {
  START_GAME,
  GAME_OVER,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');

class GameLoop {
  constructor(playerId) {
    this.playerId = playerId;
    this.command;
    this.toggleCommand;
    this.autoCommand;
    this.animationId;
    this.subscriptions = [
      subscribe(START_GAME, this.animate.bind(this)),
      subscribe(GAME_OVER, this.gameOver.bind(this)),
      subscribe(SET_COMMAND, this.setCommand.bind(this)),
      subscribe(SET_AUTO_COMMAND, this.setAutoCommand.bind(this)),
      subscribe(CLEAR_COMMAND, this.clearCommand.bind(this)),
    ];
  }

  setCommand(command) {
    if (command.type === 'command') {
      if(this.command === undefined || this.command.key !== command.key) {
        this.command = command;
      }
    } else if (command.type === 'toggleCommand') {
      if(this.toggleCommand === undefined || this.toggleCommand.key !== command.key) {
        this.toggleCommand = command;
      }
    }
  }

  setAutoCommand(command) {
    this.autoCommand = command;
  }

  clearCommand(key) {
    if (this.command !== undefined && key === this.command.key) {
      this.command = undefined;
    } else if (this.toggleCommand !== undefined && key === this.toggleCommand.key) {
      this.toggleCommand = undefined;
    }
  }

  animate(currTime = 0) {
    if (this.command !== undefined) this.command.execute(currTime);
    if (this.toggleCommand !== undefined) this.toggleCommand.execute(currTime);
    if (this.autoCommand !== undefined) this.autoCommand.execute(currTime);

    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }

  stop() {
    cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
  }

  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  gameOver({ id }) {
    if (id === this.playerId) {
      this.stop();
      this.unsubscribe();
    }
  }
}

module.exports = GameLoop;