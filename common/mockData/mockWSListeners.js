const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const serverPubSub = require('backend/helpers/pubSub');
const ClientGame = require('frontend/static/js/ClientGame');
const GameLoop = require('frontend/static/js/GameLoop');
const GameDOM = require('frontend/static/js/GameDOM');
const ClientMessage = require('frontend/static/js/ClientMessage');
const { publish } = require('frontend/helpers/pubSub');
const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { getMockDOMSelector } = require('frontend/mockData/mocks');
const {
  ADD_MESSAGE,
  PLAY,
  ADD_PLAYER,
  REMOVE_PLAYER,
  START_GAME,
  GAME_OVER,
  ADD_PIECES,
  EXECUTE_COMMANDS,
  UPDATE_PLAYER,
  ADD_POWER_UP,
} = require('frontend/helpers/clientTopics');


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
    this.player;
    this.gameServer;
    this.ws = ws;
    this.url = url;
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
    GameServer.addGame(this.url, GAME_TYPES.MULTI)
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
    this.player.game.executeCommandQueue(commands)
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
  }
}

/**
 * Represents the Client side of the mock websocket
 */
class MockClientListener {
  /**
   * Creates a MockClientListener
   * @constructor
   * @param {object} ws - mock websocket 
   * @param {Object[]} selectors - mock DOM selectors to be used by the gameDOM
   */
  constructor(ws, selectors) {
    this.gameDOM;
    this.game;
    this.gameLoop;
    this.clientMessage = new ClientMessage(getMockDOMSelector());
    this.selectors = selectors;
    this.subscriptions = [
      ws.on(ADD_PLAYER, this.addPlayer.bind(this)),
      ws.on(REMOVE_PLAYER, this.removePlayer.bind(this)),
      ws.on(START_GAME, this.startGame.bind(this)),
      ws.on(UPDATE_PLAYER, this.updatePlayer.bind(this)),
      ws.on(ADD_POWER_UP, this.addPowerUp.bind(this)),
      ws.on(ADD_PIECES, this.addPieces.bind(this)),
      ws.on(GAME_OVER, this.gameOver.bind(this)),
      ws.on(ADD_MESSAGE, this.addMessage.bind(this)),
    ];
  }

  /**
   * Adds player to client game
   * @param {number} id - player id
   */
  addPlayer(id) {
    if (!this.game) {
      this.gameDOM = new GameDOM(this.selectors, id);
      this.game = new ClientGame(id);
      this.gameLoop = new GameLoop(id);
    } else {
      publish(ADD_PLAYER, id);
    }
  }
  /**
   * Removes player from client game
   * @param {number} id - player id
   */
  removePlayer(id) {
    publish(REMOVE_PLAYER, id);
  }

  /**
   * Starts client game
   */
  startGame() {
    this.game.start();
    this.gameLoop.animate();
  }

  /**
   * Updates selected player board
   * @param {*} data
   */
  updatePlayer(data) {
    publish(UPDATE_PLAYER, data);
  }

  /**
   * Adds a new power up
   * @param {*} data 
   */
  addPowerUp(data) {
    publish(ADD_POWER_UP, data);
  }

  /**
   * Adds a new set of pieces
   * @param {array} pieces - list of piece ids
   */
  addPieces(pieces) {
    publish(ADD_PIECES, pieces);
  }

  /**
   * Game Over for a specified player
   * @param {*} data
   */
  gameOver(data) {
    publish(GAME_OVER, data);
  }

  /**
   * Unsubscribes from ws messages, as well as any pubSub topics
   */
  unsubAll() {
    this.subscriptions.forEach(unsub => unsub());
    if (this.gameDOM !== undefined) this.gameDOM.unsubscribe();
    if (this.game !== undefined) this.game.unsubscribe();
    if (this.gameLoop !== undefined) this.gameLoop.unsubscribe();
  }

  /**
   * Sends a message to be displayed on the player's screen
   * @param {object} data - message data
   * @param {string} data.type - type of message
   * @param {string} data.message - message text
   */
  addMessage(data) {
    publish(ADD_MESSAGE, data);
  }
}

module.exports = {
  MockServerListener,
  MockClientListener
};