/** app for multiplayer tetris rooms  */

const express = require('express');
const app = express();
const GameServer = require('./src/js/gameServer');
const Player = require('./src/js/player');
const pubSub = require('./src/helpers/pubSub');
const { v4: uuid } = require('uuid');
// const server = require('http').Server(app)
// const io = require('socket.io')(server);
const wsExpress = require('express-ws')(app);

// serve stuff in static/ folder
app.use(express.static('frontend/static/'));


// Get gameId and create game
app.get('/game', (req, res, next) => {
  const newGameId = uuid();

  const gameId = GameServer.addGame(newGameId);

  return res.json({ gameId });
})

/**Handle websocket messages */

//allow for app.ws routes for websocket routes
app.ws('/game/:gameId', (ws, req, next) => {
  try {    
    let gameServer;
    let player;

    gameServer = GameServer.getGame(req.params.gameId)

    if(!gameServer) {
      ws.close(1008, 'Game not found');
      throw new Error('Invalid GameId');
    }

    player = new Player(
      ws.send.bind(ws),
      pubSub()
    )

    gameServer.join(player);

    ws.on('message', m => {
      const msg = JSON.parse(m);
      if (msg.type === "newGame") player.startGame();
      if (msg.type === "executeCommands") player.game.executeCommandQueue(msg.data);
    });

    ws.on('close', () => {
      player && player.leave();
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