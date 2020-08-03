const { getGameById } = require('backend/helpers/routeHelpers');

module.exports = (req, res, next) => {
  const { gameId } = req.params;

  if (!gameId) {
    const err = new Error('No Game Id provided.');
    err.status = 400;
    return next(err);
  }

  if (!getGameById(gameId)) {
    const err = new Error('Game not found.');
    err.status = 404;
    return next(err);
  }

  return next();
}