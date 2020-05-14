const GameServer = require('../../src/js/gameServer');
const Player = require('../../src/js/player');
const serverPubSub = require('../../src/helpers/pubSub');
const Game = require('../static/js/game');
const GameDOM = require("../static/js/gameDOM");
const { publish } = require('./pubSub');


class MockServerListener {
  constructor(ws, url) {
    this.player;
    this.gameServer;
    this.ws = ws;
    this.url = url;
    this.subscriptions = [
      ws.on('open', this.open.bind(this)),
      ws.on('newGame', this.startGame.bind(this)),
      ws.on('executeCommands', this.execCommands.bind(this)),
      ws.on('close', this.close.bind(this)),
    ];
  }

  open() {
    this.gameServer = GameServer.get(this.url);
    this.player = new Player(this.ws.send.bind(this.ws), serverPubSub());
    this.gameServer.join(this.player);
  }

  startGame() {
    this.player.startGame();
  }

  execCommands(commands) {
    this.player.game.executeCommandQueue(commands)
  }

  close() {
    this.player.leave();
  }

  unsubAll() {
    this.subscriptions.forEach(unsub => unsub());
  }
}


class MockClientListener {
  constructor(ws, selectors) {
    this.gameDOM;
    this.game;
    this.selectors = selectors;
    this.subscriptions = [
      ws.on('addPlayer', this.addPlayer.bind(this)),
      ws.on('removePlayer', this.removePlayer.bind(this)),
      ws.on('startGame', this.startGame.bind(this)),
      ws.on('updatePlayer', this.updatePlayer.bind(this)),
      ws.on('addPieces', this.addPieces.bind(this)),
      ws.on('gameOver', this.gameOver.bind(this)),
    ];
  }

  addPlayer(id) {
    if (!this.game) {
      this.gameDOM = new GameDOM(this.selectors, id);
      this.game = new Game(id);
    } else {
      publish('addPlayer', id);
    }
  }

  removePlayer(id) {
    publish('removePlayer', id);
  }

  startGame(data) {
    this.game.start(data);
  }

  updatePlayer(data) {
    publish('updatePlayerBoard', data);
  }

  addPieces(pieces) {
    this.game.board.pieceList.addSet(pieces);
  }

  gameOver(data) {
    this.game.gameOver(data);
    this.gameDOM.gameOver(data);
  }

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