const GameServer = require('backend/js/gameServer');
const Player = require('backend/js/player');
const serverPubSub = require('backend/helpers/pubSub');
const ClientGame = require('frontend/static/js/clientGame');
const GameDOM = require('frontend/static/js/gameDOM');
const { publish } = require('frontend/helpers/pubSub');
const { GAME_TYPES } = require('backend/helpers/serverConstants');


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
      ws.on('play', this.startGame.bind(this)),
      ws.on('executeCommands', this.execCommands.bind(this)),
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
    this.player.startGame();
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
    this.subscriptions.forEach(unsub => unsub());
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
    this.selectors = selectors;
    this.subscriptions = [
      ws.on('addPlayer', this.addPlayer.bind(this)),
      ws.on('removePlayer', this.removePlayer.bind(this)),
      ws.on('startGame', this.startGame.bind(this)),
      ws.on('updatePlayer', this.updatePlayer.bind(this)),
      ws.on('addPowerUp', this.addPowerUp.bind(this)),
      ws.on('addPieces', this.addPieces.bind(this)),
      ws.on('gameOver', this.gameOver.bind(this)),
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
    } else {
      publish('addPlayer', id);
    }
  }

  /**
   * Removes player from client game
   * @param {number} id - player id
   */
  removePlayer(id) {
    publish('removePlayer', id);
  }

  /**
   * Starts client game
   * @param {*} data 
   */
  startGame(data) {
    this.game.start(data);
  }

  /**
   * Updates selected player board
   * @param {*} data
   */
  updatePlayer(data) {
    publish('updatePlayerBoard', data);
  }

  /**
   * Adds a new power up
   * @param {*} data 
   */
  addPowerUp(data) {
    publish('addPowerUp', data);
  }

  /**
   * Adds a new set of pieces
   * @param {array} pieces - list of piece ids
   */
  addPieces(pieces) {
    this.game.board.pieceList.addSet(pieces);
  }

  /**
   * Game Over for a specified player
   * @param {*} data
   */
  gameOver(data) {
    this.game.gameOver(data);
    this.gameDOM.gameOver(data);
  }

  /**
   * Unsubscribes from ws messages, as well as any pubSub topics
   */
  unsubAll() {
    this.subscriptions.forEach(unsub => unsub());
    this.gameDOM && this.gameDOM.unsubscribe();
    this.game && this.game.unsubscribe();
  }
}

module.exports = {
  MockServerListener,
  MockClientListener
};