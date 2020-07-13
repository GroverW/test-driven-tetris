/** app for multiplayer tetris rooms  */
require('module-alias/register');
const express = require('express');

const app = express();
const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const pubSub = require('backend/helpers/pubSub');
const uniqid = require('uniqid');
const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { PLAY, EXECUTE_COMMANDS } = require('backend/helpers/serverTopics');
const wsExpress = require('express-ws')(app);

// serve stuff in static/ folder
app.use(express.static('frontend/static/'));

app.get('/game/multi/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = GameServer.getGame(gameId);

  if (game && game.gameType === GAME_TYPES.MULTI) {
    return res.json({ gameId });
  }

  return res.status(404).json({ error: 'Game not found' });
});

// Create new multiplayer game
app.post('/game/multi', (req, res) => {
  const newGameId = uniqid();

  const gameId = GameServer.addGame(newGameId, GAME_TYPES.MULTI);

  return res.status(201).json({ gameId });
});

app.post('/game/single', (req, res) => {
  const newGameId = uniqid();

  const gameId = GameServer.addGame(newGameId, GAME_TYPES.SINGLE);

  return res.status(201).json({ gameId });
});

/** Handle websocket messages */

wsExpress.getWss().on('connection', () => console.log('connection open'));

// allow for app.ws routes for websocket routes
app.ws('/game/:gameId', (ws, req) => {
  try {
    const gameServer = GameServer.getGame(req.params.gameId);

    if (!gameServer) {
      ws.close(1008, 'Game not found');
      throw new Error('Invalid GameId');
    }

    const player = new Player(ws.send.bind(ws), pubSub());

    if (!gameServer.join(player)) {
      ws.close(1008, 'Could not join game');
      throw new Error('Unable to Join Game');
    }

    ws.on('message', (msg) => {
      const { type, data } = JSON.parse(msg);
      if (type === PLAY) player.startGame();
      if (type === EXECUTE_COMMANDS) player.game.executeCommandQueue(data);
    });

    ws.on('close', () => {
      if (player) player.leave();
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/frontend/static/index.html`);
});

module.exports = app;
