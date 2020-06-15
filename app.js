/** app for multiplayer tetris rooms  */
require('module-alias/register');
const express = require('express');
const app = express();
const GameServer = require('./src/js/GameServer');
const Player = require('./src/js/Player');
const pubSub = require('./src/helpers/pubSub');
const { v4: uuid } = require('uuid');
const { GAME_TYPES } = require('./src/helpers/serverConstants');
const wsExpress = require('express-ws')(app);

// serve stuff in static/ folder
app.use(express.static('frontend/static/'));


// Get gameId and create game
app.get('/game/multi', (req, res, next) => {
  const newGameId = uuid();

  const gameId = GameServer.addGame(newGameId, GAME_TYPES.MULTI);

  return res.json({ gameId });
});

app.get('/game/single', (req, res, next) => {
  const newGameId = uuid();

  const gameId = GameServer.addGame(newGameId, GAME_TYPES.SINGLE);

  return res.json({ gameId });
})

/**Handle websocket messages */

//allow for app.ws routes for websocket routes
app.ws('/game/:gameId', (ws, req, next) => {
  try {
    let gameServer;
    let player;

    gameServer = GameServer.getGame(req.params.gameId)

    if (!gameServer) {
      ws.close(1008, 'Game not found');
      throw new Error('Invalid GameId');
    }

    player = new Player(ws.send.bind(ws), pubSub());

    gameServer.join(player);

    ws.on('message', m => {
      const msg = JSON.parse(m);
      if (msg.type === "play") player.startGame();
      if (msg.type === "executeCommands") player.game.executeCommandQueue(msg.data);
    });

    ws.on('close', () => {
      if (player) player.leave();
    });
  }
  catch (err) {
    console.error(err);
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/frontend/static/index.html`);
});

module.exports = app;