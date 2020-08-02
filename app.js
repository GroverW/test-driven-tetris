require('module-alias/register');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const games = require('backend/routes/games');
const {
  getGameById, getNewPlayer, closeConnection, handleMessage, handleClose, createGame,
} = require('backend/helpers/routeHelpers');
// const gameWs = require('backend/routes/gameWs');

app.use(express.static('frontend/static/'));

app.use('/games', games);
// app.use('/game', gameWs);

io.of('/game').on('connection', (socket) => {
  const { gameId } = socket.handshake.query;
  socket.join(gameId);
  const gameRoom = getGameById(gameId);
  const player = getNewPlayer(socket);
  gameRoom.join(player);

  socket.on('message', handleMessage(player));
  socket.on('disconnect', handleClose(player));
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(err.status || 500);

  return res.json({
    error: err.message,
  });
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/frontend/static/index.html`);
});

module.exports = server;