const express = require('express');

const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { multiGameExists, handleGameCreation } = require('backend/helpers/routeHelpers');

const router = express.Router({ mergeParams: true });

router.get('/multi/:gameId', (req, res) => {
  const { gameId } = req.params;

  if (multiGameExists(gameId)) return res.json({ gameId });

  return res.status(404).json({ error: 'Game not found' });
});

router.post('/multi', handleGameCreation(GAME_TYPES.MULTI));

router.post('/single', handleGameCreation(GAME_TYPES.SINGLE));

module.exports = router;
