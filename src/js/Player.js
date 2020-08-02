const {
  REMOVE_PLAYER, PLAY, ADD_MESSAGE, ADD_PIECES,
} = require('backend/helpers/serverTopics');
const { formatMessage } = require('backend/helpers/serverUtils');
const ServerGame = require('./ServerGame');

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
    this.isHost = false;
    this.readyToPlay = false;
    this.send = send;
    this.pubSub = pubSub;
    this.game = new ServerGame(this.pubSub);
  }

  sendMessage(data) {
    console.log('LETS DO IT!', data)
    this.send('message', data);
  }

  sendFlash(type, message) {
    this.sendMessage({
      type: ADD_MESSAGE,
      data: { type, message },
    });
  }

  /**
   * Updates player readyToPlay state
   * @param {boolean} readyToPlay - whether the player is ready to play
   */
  updateReadyState(readyToPlay) {
    this.readyToPlay = readyToPlay;
  }

  /**
   * Set's player's id
   * @param {number} id - player id
   */
  setId(id) {
    this.id = id;
    this.game.initialize(id);
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
    if (this.game.gameStatus !== null) {
      this.updateReadyState(true);
      this.pubSub.publish(PLAY, this);
    }
  }

  addPieces(pieces) {
    this.game[ADD_PIECES](pieces);
  }
}

module.exports = Player;
