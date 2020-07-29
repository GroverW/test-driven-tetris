const express = require('express');

const { GAME_TYPES } = require('backend/helpers/serverConstants');
const { multiGameExists, createGame } = require('backend/helpers/routeHelpers');

const router = express.Router({ mergeParams: true });

router.get('/multi/:gameId', (req, res) => {
  const { gameId } = req.params;

  if (multiGameExists(gameId)) return res.json({ gameId });

  return res.status(404).json({ error: 'Game not found' });
});

// Create new multiplayer game
router.post('/multi', (req, res) => {
  const gameId = createGame(GAME_TYPES.MULTI);

  return res.status(201).json({ gameId });
});

router.post('/single', (req, res) => {
  const gameId = createGame(GAME_TYPES.SINGLE);

  return res.status(201).json({ gameId });
});

module.exports = router;
