const { subscribe } = require('frontend/helpers/pubSub');
const {
  START_GAME,
  GAME_OVER,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');


/**
 * Represents a Game Loop
 */
class GameLoop {
  /**
   * Creates a Game Loop
   * @contructor
   * @param {number} playerId - Links client to backend Game
   */
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

  /**
   * Sets the current command or toggleCommand
   * @param {object} command - Command class instance
   */
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

  /**
   * Sets the current autoCommand
   * @param {object} command - Gravity class instance
   */
  setAutoCommand(command) {
    this.autoCommand = command;
  }

  /**
   * Clears the current command or toggleCommand
   * @param {number|string} key 
   */
  clearCommand(key) {
    if (this.command !== undefined && key === this.command.key) {
      this.command = undefined;
    } else if (this.toggleCommand !== undefined && key === this.toggleCommand.key) {
      this.toggleCommand = undefined;
    }
  }

  /**
   * Starts game loop and executes commands
   * @param {number} currTime - current time in ms
   */
  animate(currTime = 0) {
    if (this.command !== undefined) this.command.execute(currTime);
    if (this.toggleCommand !== undefined) this.toggleCommand.execute(currTime);
    if (this.autoCommand !== undefined) this.autoCommand.execute(currTime);

    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }

  /**
   * Stops game loop
   */
  stop() {
    cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
  }

  /**
   * Unsubscribes from all pubSub topics.
   */
  unsubscribe() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  /**
   * Ends the current game.
   * @param {number} id - id of player whose game is over
   */
  gameOver({ id }) {
    if (id === this.playerId) {
      this.stop();
      this.unsubscribe();
    }
  }
}

module.exports = GameLoop;