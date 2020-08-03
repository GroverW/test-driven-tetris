const express = require('express');

const {
  getGameById, getNewPlayer, closeConnection, handleMessage, handleClose,
} = require('backend/helpers/routeHelpers');

const router = express.Router({ mergeParams: true });

router.ws('/', (ws, req, next) => { // eslint-disable-line consistent-return
  try {
    const { gameId } = req.params;
    const gameServer = getGameById(gameId);
    const player = getNewPlayer(ws);

    if (!gameServer.join(player)) closeConnection(ws, 'Could not join game.');

    ws.on('message', handleMessage(player));
    ws.on('close', handleClose(player));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
