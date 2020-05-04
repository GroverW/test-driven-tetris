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
    this.unsub1 = ws.on('open', this.open.bind(this));
    this.unsub2 = ws.on('newGame', this.startGame.bind(this));
    this.unsub3 = ws.on('executeCommands', this.execCommands.bind(this));
    this.unsub4 = ws.on('close', this.close.bind(this));
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
    this.unsub1();
    this.unsub2();
    this.unsub3();
    this.unsub4();
  }
}


class MockClientListener {
  constructor(ws, selectors) {
    this.gameDOM;
    this.game;
    this.selectors = selectors;
    this.unsub1 = ws.on('addPlayer', this.addPlayer.bind(this));
    this.unsub2 = ws.on('removePlayer', this.removePlayer.bind(this));
    this.unsub3 = ws.on('startGame', this.startGame.bind(this));
    this.unsub4 = ws.on('addPieces', this.addPlayer.bind(this));
    this.unsub5 = ws.on('gameOver', this.gameOver.bind(this));
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

  addPieces(pieces) {
    this.game.board.addPieces(pieces);
  }

  gameOver(id) {
    this.game.gameOver(id);
  }

  unsubAll() {
    this.unsub1();
    this.unsub2();
    this.unsub3();
    this.unsub4();
    this.unsub5();
    this.gameDOM && this.gameDOM.unsubscribe();
    this.game && this.game.unsubscribe();
  }
}

module.exports = {
  MockServerListener,
  MockClientListener
};