/**
 * server for tetris
 */
const server = require('./app');

const SERVER_PORT = 3000;

server.listen(process.env.PORT || SERVER_PORT, () => {
  console.log(`Server started on ${SERVER_PORT}`);
});
