const { GAMES } = require('backend/constants');
const GameRoom = require('backend/js/GameRoom');
const uniqid = require('uniqid');
const { isValidGameType } = require('./helpers');

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
    return GAMES.get(id) || false;
  }

  /**
   * Adds a new game if id does not already exist
   * @param {string} gameType - type of game to add (single or multiplayer)
   * @returns {string} - id of new game
   */
  static addGame(gameType) {
    const id = uniqid();

    if (
      !isValidGameType(gameType)
      || GAMES.has(id)
    ) return false;

    GAMES.set(id, new GameRoom(id, gameType, this.removeGame.bind(this)));

    return id;
  }

  /**
   * Removes specified game
   * @param {string} id - id of game to remove
   * @returns {boolean} - true / false if successfully deleted
   */
  static removeGame(id) {
    return GAMES.delete(id);
  }
}

module.exports = GameServer;
