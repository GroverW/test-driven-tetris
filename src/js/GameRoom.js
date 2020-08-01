const PlayerManager = require('backend/js/PlayerManager');
const GameManager = require('backend/js/GameManager');
const { MAX_PLAYERS } = require('backend/helpers/serverConstants');
const { MSG_TYPE } = require('backend/helpers/serverTopics');

class GameRoom {
  constructor(gameType) {
    this.gameType = gameType;
    this.players = new PlayerManager();
    this.manager = new GameManager(gameType, this.players);
    this.nextPlayerId = 1;
  }

  roomAvailable(player) {
    if (this.roomIsFull()) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game is full.')
      return false;
    }

    if (this.manager.gameStarted) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game has already started.');
      return false;
    }

    return true;
  }

  roomIsFull() {
    return this.players.count >= MAX_PLAYERS[this.gameType];
  }

  addToRoom(player) {
    if (!this.players.add(player)) {
      player.sendFlash(MSG_TYPE.ERROR, 'Somehow you\'re already in the room...');
      return false;
    }

    return true;
  }

  setPlayerAttributes(player) {
    player.setId(this.nextPlayerId);
    player.setGameType(this.gameType);
    this.nextPlayerId += 1;
  }

  join(player) {
    // if (!this.checkGameStatus(player)) return false;
    // if (this.players.includes(player)) return false;

    // this.nextPlayerId += 1;
    // player.setId(this.nextPlayerId);
    // player.setGameType(this.gameType);

    // this.players.push(player);
    // this.addSubscriptions(player);

    // // send new player to existing players
    // this.sendAll({ type: ADD_PLAYER, data: player.id });

    // // send existing players to new player
    // this.players.forEach((p) => {
    //   if (p !== player) player.sendMessage({ type: ADD_PLAYER, data: p.id });
    // });

    // this.setHostOnJoin();

    // return true;
  }
}

module.exports = GameRoom;