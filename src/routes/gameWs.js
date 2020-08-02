const {
  getGameById, getNewPlayer, handleMessage, handleClose, ensureGameExists,
} = require('backend/helpers/routeHelpers');

module.exports = (io) => {
  io.of('/game')
    .use(ensureGameExists)
    .on('connection', (socket) => {
      const { gameId } = socket.handshake.query;
      socket.join(gameId);

      const gameRoom = getGameById(gameId);
      const player = getNewPlayer(socket);

      if (!gameRoom.join(player)) socket.disconnect();

      socket.on('message', handleMessage(player));
      socket.on('disconnect', handleClose(player));
    });
};
