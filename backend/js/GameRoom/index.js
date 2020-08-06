const { MAX_PLAYERS } = require('backend/constants');
const {
  MSG_TYPE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  PLAY,
  GAME_OVER,
  GET_PIECES,
  UPDATE_PLAYER,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('backend/topics');
const PlayerManager = require('./PlayerManager');
const GameManager = require('./GameManager');

class GameRoom {
  constructor(id, gameType, removeGameRoom) {
    this.id = id;
    this.gameType = gameType;
    this.removeGameRoom = removeGameRoom;
    this.players = new PlayerManager();
    this.manager = new GameManager(id, gameType, this.players);
    this.nextPlayerId = 1;
    this.subscriptions = {};
  }

  roomFull() {
    return this.players.count >= MAX_PLAYERS[this.gameType];
  }

  roomAvailable(player) {
    if (this.roomFull()) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game is full.');
      return false;
    }

    if (this.manager.gameStarted) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game has already started.');
      return false;
    }

    return true;
  }

  addToRoom(player) {
    if (!this.players.add(player)) {
      player.sendFlash(MSG_TYPE.ERROR, 'Somehow you\'re already in the room...');
      return false;
    }

    return true;
  }

  removeFromRoom(player) {
    if (!this.players.remove(player)) return false;

    return true;
  }

  removePlayer(player) {
    if (!this.removeFromRoom(player)) return false;

    this.removeSubscriptions(player);
    return true;
  }

  setPlayerAttributes(player) {
    player.setId(this.nextPlayerId);
    player.setGameType(this.gameType);
    this.nextPlayerId += 1;
  }

  addSubscriptions(player) {
    this.subscriptions[player.id] = [
      player.pubSub.subscribe(REMOVE_PLAYER, this.leave.bind(this)),
      player.pubSub.subscribe(PLAY, this.manager.playerReady.bind(this.manager)),
      player.pubSub.subscribe(GAME_OVER, this.manager.gameOver.bind(this.manager)),
      player.pubSub.subscribe(GET_PIECES, this.manager.getPieces.bind(this.manager)),
      player.pubSub.subscribe(
        UPDATE_PLAYER, this.manager.msg.sendPlayerUpdateToOthers.bind(this.manager.msg),
      ),
      player.pubSub.subscribe(ADD_POWER_UP, this.manager.msg.sendPowerUp.bind(this.manager.msg)),
      player.pubSub.subscribe(USE_POWER_UP, this.manager.executePowerUp.bind(this.manager)),

    ];
  }

  removeSubscriptions(player) {
    this.subscriptions[player.id].forEach((unsub) => unsub());
    delete this.subscriptions[player.id];
  }

  syncPlayersWith(player) {
    if (this.players.getById(player.id)) {
      this.manager.msg.sendAll({ type: ADD_PLAYER, data: player.id });
      this.manager.msg.addOtherPlayersTo(player);
    } else {
      this.manager.msg.sendAll({ type: REMOVE_PLAYER, data: player.id });
    }
  }

  join(player) {
    if (!this.roomAvailable(player)) return false;
    if (!this.addToRoom(player)) return false;

    this.setPlayerAttributes(player);
    this.addSubscriptions(player);
    this.syncPlayersWith(player);

    return true;
  }

  leave(player) {
    if (!this.removePlayer(player)) return false;
    if (this.players.count === 0) this.removeGameRoom(this.id);

    this.syncPlayersWith(player);
    this.manager.checkIfWinnerAndEndGame();

    return true;
  }

  unsubscribe() {
    Object.entries(this.subscriptions).forEach(([id, subscriberList]) => {
      subscriberList.forEach((unsub) => unsub());
      delete this.subscriptions[id];
    });
  }
}

module.exports = GameRoom;
