const ClientGame = require('frontend/static/js/ClientGame');
const gameLoop = require('frontend/static/js/GameLoop');
const gameDOM = require('frontend/static/js/GameDOM');
const clientMessage = require('frontend/static/js/ClientMessage');
const { publish } = require('frontend/helpers/pubSub');
const { getMockDOMSelector } = require('frontend/mockData/mocks');
const { formatMessage } = require('common/helpers/utils');
const {
  ADD_MESSAGE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  START_GAME,
  GAME_OVER,
  ADD_PIECES,
  UPDATE_PLAYER,
  ADD_POWER_UP,
} = require('frontend/helpers/clientTopics');

/**
 * Removes player from client game
 * @param {number} id - player id
 */
const removePlayer = (id) => {
  publish(GAME_OVER, { id });
  publish(REMOVE_PLAYER, id);
};

/**
 * Publishes data to a specified topic
 * @param {string} topic - Topic to publish
 * @param {*} data - Data to send
 */
const publishTopic = (topic, data) => {
  publish(topic, data);
};

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
    this.ws = ws;
    this.clientMessage = clientMessage;
    this.clientMessage.initialize(getMockDOMSelector());
    this.selectors = selectors;
    this.subscriptions = [
      ws.on(ADD_PLAYER, this.addPlayer.bind(this)),
      ws.on(REMOVE_PLAYER, removePlayer),
      ws.on(START_GAME, this.startGame.bind(this)),
      ws.on(UPDATE_PLAYER, (data) => publishTopic(UPDATE_PLAYER, data)),
      ws.on(ADD_POWER_UP, (data) => publishTopic(ADD_POWER_UP, data)),
      ws.on(ADD_PIECES, (data) => publishTopic(ADD_PIECES, data)),
      ws.on(GAME_OVER, (data) => publishTopic(GAME_OVER, data)),
      ws.on(ADD_MESSAGE, (data) => publishTopic(ADD_MESSAGE, data)),
    ];
  }

  /**
   * Adds player to client game
   * @param {number} id - player id
   */
  addPlayer(id) {
    if (!this.game) {
      this.gameDOM = gameDOM;
      this.gameDOM.initialize(this.selectors, id);
      this.game = new ClientGame(id);
      this.gameLoop = gameLoop;
      this.gameLoop.initialize(id);
    } else {
      publish(ADD_PLAYER, id);
    }
  }

  /**
   * Starts client game
   */
  startGame() {
    this.game[START_GAME]();
    this.gameLoop[START_GAME]();
  }

  closeWindow() {
    this.ws.send(formatMessage({ type: 'close' }));
  }

  /**
   * Unsubscribes from ws messages, as well as any pubSub topics
   */
  unsubAll() {
    this.subscriptions.forEach((unsub) => unsub());
    if (this.gameDOM !== undefined) this.gameDOM.unsubscribe();
    if (this.game !== undefined) this.game.unsubscribe();
    if (this.gameLoop !== undefined) this.gameLoop.gameOver({ id: this.gameLoop.playerId });
  }

  getProp(property) {
    return {
      numPlayers: [
        this.gameDOM.players.length,
        this.gameDOM.gameView.players.length,
        this.game.players.length,
      ],
      pieces: JSON.parse(JSON.stringify(this.game.board.pieceList.pieces)),
      messagePresent: this.gameDOM.message.children.length > 0,
      board: JSON.parse(JSON.stringify(this.game.board.grid)),
      score: this.game.score,
      gameStatus: this.game.gameStatus,
      numPowerUps: this.gameDOM.powerUps.filter((p) => p.type).length,
      flashMessage: this.clientMessage.message.innerText,
    }[property];
  }
}

module.exports = MockClientListener;
