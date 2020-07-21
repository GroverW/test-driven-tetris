const SubscriberBase = require('common/js/SubscriberBase');
const pubSub = require('frontend/helpers/pubSub');

const {
  START_GAME,
  SET_COMMAND,
  SET_AUTO_COMMAND,
  CLEAR_COMMAND,
} = require('frontend/helpers/clientTopics');

/**
 * Represents a Game Loop
 */
class GameLoop extends SubscriberBase {
  /**
   * Creates a Game Loop
   * @contructor
   * @param {number} playerId - Links client to backend Game
   */
  constructor() {
    super(pubSub);
  }

  initialize(playerId) {
    super.initialize(playerId);
    this.mapSubscriptions([START_GAME, SET_COMMAND, SET_AUTO_COMMAND, CLEAR_COMMAND]);
  }

  /**
   * Sets the current command or toggleCommand
   * @param {object} command - Command class instance
   */
  [SET_COMMAND](command) {
    if (command.type === 'command') {
      if (this.command === undefined || this.command.key !== command.key) {
        this.command = command;
      }
    } else if (command.type === 'toggleCommand') {
      if (this.toggleCommand === undefined || this.toggleCommand.key !== command.key) {
        this.toggleCommand = command;
      }
    }
  }

  /**
   * Sets the current autoCommand
   * @param {object} command - Gravity class instance
   */
  [SET_AUTO_COMMAND](command) {
    this.autoCommand = command;
  }

  /**
   * Clears the current command or toggleCommand
   * @param {number|string} key
   */
  [CLEAR_COMMAND](key) {
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
  [START_GAME](currTime = 0) {
    if (this.command !== undefined) this.command.execute(currTime);
    if (this.toggleCommand !== undefined) this.toggleCommand.execute(currTime);
    if (this.autoCommand !== undefined) this.autoCommand.execute(currTime);

    this.animationId = requestAnimationFrame(this[START_GAME].bind(this));
  }

  /**
   * Stops game loop
   */
  stop() {
    cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
  }

  /**
   * Stops animation and ends the current game.
   */
  gameOverAction() {
    this.stop();
    this.unsubscribe();
  }
}

const gameLoop = new GameLoop();

module.exports = gameLoop;
