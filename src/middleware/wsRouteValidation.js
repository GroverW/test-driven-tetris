const ExpressError = require('backend/js/ExpressError');
const { getGameById } = require('backend/helpers/routeHelpers');

module.exports = (req, res, next) => {
  const { gameId } = req.params;

  if (!gameId) {
    const err = new ExpressError(400, 'No Game Id provided.');
    return next(err);
  }

  if (!getGameById(gameId)) {
    const err = new ExpressError(404, 'Game not found.');
    return next(err);
  }

  return next();
};
