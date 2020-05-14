const { GAMES, MAX_PLAYERS, RANKINGS, SEED_PIECES } = require('../helpers/data');
const { randomize } = require('../helpers/utils');

class GameServer {
  constructor(id) {
    this.id = id;
    this.players = new Set();
    this.nextPlayerId = 0;
    this.gameStarted = false;
    this.nextRanking;
    this.subscriptions = {};
  }

  static get(id) {
    if (!GAMES.has(id)) GAMES.set(id, new GameServer(id))

    return GAMES.get(id);
  }

  join(player) {
    if (this.players.size < MAX_PLAYERS && !this.gameStarted) {
      this.players.add(player);
      
      player.setId(++this.nextPlayerId);
      this.addSubscriptions(player)

      if (this.players.size === 1) player.isHost = true;

      this.sendAll({
        type: 'addPlayer',
        data: player.id,
      });

      this.players.forEach(p => {
        if(p !== player) {
          this.sendTo(player, {
            type: 'addPlayer',
            data: p.id,
          })
        }
      })

      return true;
    }

    return false;
  }

  addSubscriptions(player) {
    this.subscriptions[player.id] = [
      player.pubSub.subscribe('leave', this.leave.bind(this)),
      player.pubSub.subscribe('startGame', this.startGame.bind(this)),
      player.pubSub.subscribe('gameOver', this.gameOver.bind(this)),
      player.pubSub.subscribe('getPieces', this.getPieces.bind(this)),
      player.pubSub.subscribe('updatePlayer', this.updatePlayer.bind(this)),
    ]
  }

  removeSubscriptions(id) {
    this.subscriptions[id].forEach(unsub => unsub());
  }

  leave(player) {
    if (this.players.has(player)) {
      if (player.isHost && this.players.size > 1) this.setNewHost()

      this.removeSubscriptions(player.id);
      this.players.delete(player);

      this.players.size === 0
        ? GAMES.delete(this.id)
        : this.sendAllExcept(player, {
            type: 'removePlayer',
            data: player.id
          });

      return true;
    }

    return false;
  }

  setNewHost() {
    const playersIterator = this.players.values();
    playersIterator.next()
    const newHost = playersIterator.next().value;
    newHost.isHost = true;
  }

  sendAll(data) {
    this.players.forEach(player => player._send(JSON.stringify(data)));
  }

  sendAllExcept(exceptPlayer, data) {
    this.players.forEach(player =>
      (player !== exceptPlayer) && player._send(JSON.stringify(data))
    );
  }

  sendTo(player, data) {
    player._send(JSON.stringify(data));
  }

  startGame(player) {
    if(player && player.isHost) {
      this.gameStarted = true;

      this.getPieces();

      this.players.forEach(p => p.game.start());
      
      this.sendAll({
        type: 'startGame',
      });

      this.nextRanking = this.players.size;
    }
  }

  updatePlayer(data) {
    this.sendAll({
      type: 'updatePlayer',
      data: {
        id: data.id,
        board: data.board,
      }
    })
  }

  getPieces() {
    const pieces = randomize(SEED_PIECES);

    this.players.forEach(player => {
      player.game.board.pieceList.addSet(pieces);
      
      player._send(JSON.stringify({
        type: 'addPieces',
        data: pieces
      }))
    })
  }

  gameOver(data) {
    this.sendAll({
      type: 'gameOver',
      data: {
        id: data.id,
        board: data.board,
        ranking: RANKINGS[this.nextRanking],
      }
    });

    this.nextRanking--;
  }

  unsubscribe() {
    Object.values(this.subscriptions)
      .forEach(p => p.forEach(unsub => unsub()));
  }
}

module.exports = GameServer;