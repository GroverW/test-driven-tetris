const { GAME_TYPES } = require('common/helpers/constants');
const { PLAY, EXECUTE_COMMANDS } = require('backend/helpers/serverTopics');
const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const pubSub = require('backend/helpers/pubSub');

const multiGameExists = (gameId) => {
  const gameServer = GameServer.getGame(gameId);

  return (gameServer && gameServer.gameType === GAME_TYPES.MULTI);
};

const getGameById = (gameId) => {
  const gameServer = GameServer.getGame(gameId);

  return gameServer;
};

const createGame = (type) => GameServer.addGame(type);

const handleGameCreation = (type) => (req, res, next) => {
  const gameId = createGame(type);

  if (gameId) return res.status(201).json({ gameId });

  const err = new Error('Could not create game.');
  return next(err);
};

const getNewPlayer = (socket) => new Player(socket.emit.bind(socket), pubSub());

const closeConnection = (ws, message) => {
  ws.close(1008, message);
  throw new Error(message);
};

const handleMessage = (player) => (msg) => {
  console.log('WAO!', msg)
  const { type, data } = msg;
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
  closeConnection,
  handleMessage,
  handleClose,
};
