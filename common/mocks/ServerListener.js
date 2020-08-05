const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const serverPubSub = require('backend/helpers/pubSub');

const { GAME_TYPES } = require('backend/constants');

const { PLAY, EXECUTE_COMMANDS } = require('common/topics');

/**
 * Represents the Server side of the mock websocket
 */
class MockServerListener {
  /**
   * Creates a MockServerListener
   * @constructor
   * @param {object} ws - mock websocket
   */
  constructor(ws) {
    this.ws = ws;
    this.subscriptions = [
      ws.on('open', this.open.bind(this)),
      ws.on(PLAY, this.startGame.bind(this)),
      ws.on(EXECUTE_COMMANDS, this.execCommands.bind(this)),
      ws.on('close', this.close.bind(this)),
    ];
  }

  /**
   * Creates a new game room and Player. Adds the Player to the game room
   */
  open() {
    const id = GameServer.addGame(GAME_TYPES.MULTI);
    this.gameRoom = GameServer.getGame(id);
    this.player = new Player(this.ws.send.bind(this.ws), serverPubSub());
    this.gameRoom.join(this.player);
  }

  /**
   * Starts the game
   */
  startGame() {
    this.gameRoom.players.list.forEach((player) => player.startGame());
  }

  /**
   * Executes a list of commands
   * @param {string[]} commands - list of commands
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
    if (this.gameRoom !== undefined) this.gameRoom.unsubscribe();
  }

  getProp(property) {
    return {
      numPlayers: this.gameRoom.players.count,
      gameStarted: this.gameRoom.manager.gameStarted,
      pieces: JSON.parse(JSON.stringify(this.player.game.board.pieceList.pieces)),
      board: JSON.parse(JSON.stringify(this.player.game.board.grid)),
      score: this.player.game.score,
      gameStatus: this.player.game.gameStatus,
      numPowerUps: this.player.game.powerUps.length,
    }[property];
  }
}

module.exports = MockServerListener;
