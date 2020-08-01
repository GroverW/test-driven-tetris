const {
  GAME_OVER, GAME_MESSAGE, ADD_POWER_UP, UPDATE_PLAYER,
} = require('backend/helpers/serverTopics');
const { GAME_TYPES } = require('backend/helpers/serverConstants');
const {
  multiPlayerGameOverMessage, singlePlayerGameOverMessage,
} = require('backend/helpers/serverUtils');

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

  sendGameOverMessage(id, board, ranking = false) {
    const player = this.players.getById(id);
    const message = this.getGameOverMessage(player, ranking);

    this.sendAll({
      type: GAME_OVER,
      data: { id, board, message },
    });
  }

  getGameOverMessage(player, ranking) {
    if (this.gameType === GAME_TYPES.MULTI) return multiPlayerGameOverMessage(ranking);
    if (this.gameType === GAME_TYPES.SINGLE) return singlePlayerGameOverMessage(player);
    return null;
  }

  sendGameMessage(header, body = []) {
    this.sendAll({
      type: GAME_MESSAGE,
      data: { header, body },
    });
  }

  sendPowerUp(id, data) {
    const player = this.players.getById(id);
    if (player) {
      player.sendMessage({
        type: ADD_POWER_UP,
        data,
      });
    }
  }

  sendPlayerUpdate(data) {
    this.sendAll({
      type: UPDATE_PLAYER,
      data,
    });
  }

  sendPlayerUpdateToOthers(player, data) {
    this.sendAllExcept(
      player,
      { type: UPDATE_PLAYER, data },
    );
  }
}

module.exports = MessageManager;
