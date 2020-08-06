const express = require('express');

const {
  handleMessage, handleClose, handleGameValidation,
} = require('backend/helpers/routeHelpers');

const router = express.Router({ mergeParams: true });

router.ws('/:gameId', (ws, req, next) => { // eslint-disable-line consistent-return
  try {
    const { gameId } = req.params;
    const player = handleGameValidation(gameId, ws);

    ws.on('message', handleMessage(player));
    ws.on('close', handleClose(player));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
