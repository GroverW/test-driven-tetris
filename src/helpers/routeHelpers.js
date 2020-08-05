const { GAME_TYPES } = require('common/helpers/constants');
const { PLAY, EXECUTE_COMMANDS } = require('backend/helpers/serverTopics');
const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const pubSub = require('backend/helpers/pubSub');

const multiGameExists = (gameId) => {
  const gameServer = GameServer.getGame(gameId);

  return (gameServer && gameServer.gameType === GAME_TYPES.MULTI);
};

const getGameById = (gameId) => GameServer.getGame(gameId);

const createGame = (type) => GameServer.addGame(type);

const getNewPlayer = (ws) => new Player(ws.send.bind(ws), pubSub());

const closeConnection = (ws, message) => ws.close(1008, message);

const handleGameValidation = (gameId, ws) => {
  const gameServer = getGameById(gameId);
  const player = getNewPlayer(ws);

  if (!getGameById(gameId)) closeConnection(ws, 'Game not found');
  if (!gameServer.join(player)) closeConnection(ws, 'Could not join game.');

  return player;
}

const handleGameCreation = (type) => (req, res, next) => {
  const gameId = createGame(type);

  if (gameId) return res.status(201).json({ gameId });

  const err = new Error('Unable to create game.');
  return next(err);
};

const handleMessage = (player) => (msg) => {
  const { type, data } = JSON.parse(msg);
  if (type === PLAY) player.startGame();
  if (type === EXECUTE_COMMANDS) player.game.executeCommandQueue(data);
};

const handleClose = (player) => () => {
  if (player) player.leave();
};

module.exports = {
  multiGameExists,
  getGameById,
  getNewPlayer,
  createGame,
  handleGameCreation,
  handleGameValidation,
  closeConnection,
  handleMessage,
  handleClose,
};
