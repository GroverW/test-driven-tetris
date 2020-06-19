const ServerGame = require('./ServerGame');
const { REMOVE_PLAYER, START_GAME } = require('backend/helpers/serverTopics');

/**
 * Represents a player on the back-end
 */
class Player {
  /**
   * @constructor
   * @param {function} send - the websocket method to send messages for specified player
   * @param {object} pubSub - the player's publish/subscribe object
   */
  constructor(send, pubSub) {
    this.id;
    this.isHost = false;
    this.send = send;
    this.pubSub = pubSub;
    this.game = new ServerGame(this.pubSub);
  }

  /**
   * Set's player's id
   * @param {number} id - player id
   */
  setId(id) {
    this.id = id;
    this.game.playerId = id;
    this.game.board.playerId = id;
  }

  setGameType(type) {
    this.game.gameType = type;
  }

  /**
   * Publishes a message for the specified player to leave the gameServer
   */
  leave() {
    this.pubSub.publish(REMOVE_PLAYER, this);
  }

  /**
   * Publishes a message for the current game to be started
   */
  startGame() {
    if (this.game.gameStatus !== null) this.pubSub.publish(START_GAME, this);
  }
}

module.exports = Player