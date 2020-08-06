const { GAMES } = require('backend/constants');
const GameRoom = require('backend/js/GameRoom');
const uniqid = require('uniqid');

/**
 * Represents a game server
 */
class GameServer {
  /**
   * Gets a specified gameServer instance
   * @param {string} id - id of game to get
   * @returns {object|boolean} - either a gameServer or false if not found
   */
  static getGame(id) {
    if (GAMES.has(id)) return GAMES.get(id);

    return false;
  }

  /**
   * Adds a new game if id does not already exist
   * @param {string} gameType - type of game to add (single or multiplayer)
   * @returns {string} - id of new game
   */
  static addGame(gameType) {
    const id = uniqid();

    if (!GAMES.has(id)) GAMES.set(id, new GameRoom(id, gameType, this.removeGame.bind(this)));

    return id;
  }

  /**
   * Removes specified game
   * @param {string} id - id of game to remove
   */
  static removeGame(id) {
    if (GAMES.has(id)) {
      GAMES.delete(id);
      return true;
    }

    return false;
  }
}

module.exports = GameServer;
