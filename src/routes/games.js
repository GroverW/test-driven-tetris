const express = require('express');

const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { multiGameExists, handleGameCreation } = require('backend/helpers/routeHelpers');

const router = express.Router({ mergeParams: true });

router.get('/multi/:gameId', (req, res, next) => {
  const { gameId } = req.params;

  if (multiGameExists(gameId)) return res.json({ gameId });

  const err = new Error('Game not found');
  err.status = 404;

  return next(err);
});

router.post('/multi', handleGameCreation(GAME_TYPES.MULTI));

router.post('/single', handleGameCreation(GAME_TYPES.SINGLE));

module.exports = router;
