/** app for multiplayer tetris rooms  */

const express = require('express');
const app = express();
// const server = require('http').Server(app)
// const io = require('socket.io')(server);
const wsExpress = require('express-ws')(app);

// serve stuff in static/ folder
app.use(express.static('../frontend/static/'));

/**Handle websocket messages */

//allow for app.ws routes for websocket routes
app.ws('/test', (ws, req, next) => {


  ws.on('connection', () => {
    console.log("CONNECTED!")
    ws.send('you did it');
  });

  ws.on('message', msg => {
    ws.send(msg);
  });
})

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/../frontend/static/index.html`);
});

module.exports = app;