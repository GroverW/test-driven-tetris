/** app for multiplayer tetris rooms  */
require('module-alias/register');
const express = require('express');

const app = express();
const wsExpress = require('express-ws')(app);
const {
  getGameById, getNewPlayer, closeConnection, handleMessage, handleClose,
} = require('backend/helpers/routeHelpers');
const games = require('backend/routes/games');

app.use(express.static('frontend/static/'));

app.use('/games', games);

wsExpress.getWss().on('connection', () => console.log('connection open'));

app.ws('/game/:gameId', (ws, req) => {
  try {
    const { gameId } = req.params;
    const gameServer = getGameById(gameId);
    const player = getNewPlayer(ws);

    if (!gameServer) closeConnection(ws, 'Game not found.');
    if (!gameServer.join(player)) closeConnection(ws, 'Could not join game.');

    ws.on('message', handleMessage(player));
    ws.on('close', handleClose(player));
  } catch (err) {
    console.error(err);
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/frontend/static/index.html`);
});

module.exports = app;
