const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const serverPubSub = require('backend/helpers/pubSub');

const { GAME_TYPES } = require('backend/helpers/serverConstants');

const { PLAY, EXECUTE_COMMANDS } = require('common/helpers/commonTopics');

const getNewUrl = (url = 1) => {
  let newUrl = url;

  while (GameServer.getGame(newUrl)) newUrl += 1;

  return newUrl;
};

/**
 * Represents the Server side of the mock websocket
 */
class MockServerListener {
  /**
   * Creates a MockServerListener
   * @constructor
   * @param {object} ws - mock websocket
   * @param {string} url - the url of the gameServer to connect to
   */
  constructor(ws, url) {
    this.ws = ws;
    this.url = getNewUrl(url);
    this.subscriptions = [
      ws.on('open', this.open.bind(this)),
      ws.on(PLAY, this.startGame.bind(this)),
      ws.on(EXECUTE_COMMANDS, this.execCommands.bind(this)),
      ws.on('close', this.close.bind(this)),
    ];
  }

  /**
   * Creates a new gameServer and Player. Adds the Player to the gameServer
   */
  open() {
    GameServer.addGame(this.url, GAME_TYPES.MULTI);
    this.gameServer = GameServer.getGame(this.url);
    this.player = new Player(this.ws.send.bind(this.ws), serverPubSub());
    this.gameServer.join(this.player);
  }

  /**
   * Starts the game
   */
  startGame() {
    this.gameServer.players.forEach((player) => player.startGame());
  }

  /**
   * Executes a list of commands
   * @param {array} commands - list of commands
   */
  execCommands(commands) {
    this.player.game.executeCommandQueue(commands);
  }

  /**
   * Removes the Player from the gameServer
   */
  close() {
    this.player.leave();
  }

  /**
   * Unsubscribes from all websocket messages
   */
  unsubAll() {
    this.subscriptions.forEach((unsub) => unsub());
    if (this.gameServer !== undefined) this.gameServer.unsubscribe();
  }
}

module.exports = MockServerListener;
