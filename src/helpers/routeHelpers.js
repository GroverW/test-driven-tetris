const { GAME_TYPES } = require('common/helpers/constants');
const { PLAY, EXECUTE_COMMANDS } = require('backend/helpers/serverTopics');
const GameServer = require('backend/js/GameServer');
const Player = require('backend/js/Player');
const pubSub = require('backend/helpers/pubSub');
const uniqid = require('uniqid');

const multiGameExists = (gameId) => {
  const gameServer = GameServer.getGame(gameId);

  return (gameServer && gameServer.gameType === GAME_TYPES.MULTI);
};

const getGameById = (gameId) => {
  const gameServer = GameServer.getGame(gameId);

  return gameServer;
};

const createGame = (type) => {
  const newGameId = uniqid();
  return GameServer.addGame(newGameId, type);
};

const handleGameCreation = (type) => (req, res) => {
  const gameId = createGame(type);

  return res.status(201).json({ gameId });
};

const getNewPlayer = (ws) => new Player(ws.send.bind(ws), pubSub());

const closeConnection = (ws, message) => {
  ws.close(1008, message);
  throw new Error(message);
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
  closeConnection,
  handleMessage,
  handleClose,
};
