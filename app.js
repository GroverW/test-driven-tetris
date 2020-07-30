/** app for multiplayer tetris rooms  */
require('module-alias/register');
const express = require('express');

const app = express();

const games = require('backend/routes/games');
const gameWs = require('backend/routes/gameWs');

app.use(express.static('frontend/static/'));

app.use('/games', games);
app.use('/game', gameWs);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err.message,
  });
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/frontend/static/index.html`);
});

module.exports = app;
