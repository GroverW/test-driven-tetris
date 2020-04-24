/** app for multiplayer tetris rooms  */

const express = require('express');
const app = express();

// serve stuff in static/ folder
app.use(express.static('static/'));

/**Handle websocket messages */

//allow for app.ws routes for websocket routes
const wsExpress = require('express-ws')(app);