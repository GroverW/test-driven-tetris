require('module-alias/register');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const games = require('backend/routes/games');

app.use(express.static('frontend/static/'));

app.use('/games', games);
require('backend/routes/gameWs')(io);

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