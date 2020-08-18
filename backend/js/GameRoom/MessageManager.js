const {
  GAME_OVER, GAME_MESSAGE, ADD_POWER_UP, ADD_PLAYER, UPDATE_PLAYER,
} = require('backend/topics');
const { GAME_TYPES } = require('backend/constants');
const {
  multiPlayerGameOverMessage, singlePlayerGameOverMessage,
} = require('backend/helpers/utils');

class MessageManager {
  constructor(gameType, players) {
    this.gameType = gameType;
    this.players = players;
  }

  sendAll(data) {
    this.players.list.forEach((player) => player.sendMessage(data));
  }

  sendAllExcept(exceptPlayer, data) {
    this.players.list.forEach((player) => {
      if (player !== exceptPlayer) player.sendMessage(data);
    });
  }

  sendGameOverMessage(id, grid, ranking = false) {
    const player = this.players.getById(id);
    const message = this.getGameOverMessage(player, ranking);

    this.sendAll({
      type: GAME_OVER,
      data: { id, grid, message },
    });
  }

  getGameOverMessage(player, ranking) {
    if (this.gameType === GAME_TYPES.MULTI) return multiPlayerGameOverMessage(ranking);
    if (this.gameType === GAME_TYPES.SINGLE) return singlePlayerGameOverMessage(player);
    return null;
  }

  sendGameMessage(header, ...bodyList) {
    const body = bodyList || [];

    this.sendAll({
      type: GAME_MESSAGE,
      data: { header, body },
    });
  }

  sendPowerUp({ id, powerUp }) {
    const player = this.players.getById(id);
    if (player) {
      player.sendMessage({
        type: ADD_POWER_UP,
        data: powerUp,
      });
    }
  }

  sendWaitingMessage(playersReady, gameId) {
    this.sendGameMessage(
      'Waiting for others',
      `${playersReady} out of ${this.players.count} players ready`,
      `Game ID: ${gameId}`,
    );
  }

  sendPlayerUpdate(data) {
    this.sendAll({
      type: UPDATE_PLAYER,
      data,
    });
  }

  sendPlayerUpdateToOthers({ id, grid }) {
    const player = this.players.getById(id);
    this.sendAllExcept(
      player,
      { type: UPDATE_PLAYER, data: { id, grid } },
    );
  }

  addOtherPlayersTo(player) {
    this.players.list.forEach((p) => {
      if (p !== player) player.sendMessage({ type: ADD_PLAYER, data: p.id });
    });
  }
}

module.exports = MessageManager;
