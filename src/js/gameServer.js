const {
  GAMES,
  GAME_TYPES,
  MAX_PLAYERS,
  RANKINGS,
  SEED_PIECES
} = require('../helpers/data');
const { randomize } = require('../helpers/utils');

class GameServer {
  constructor(id, gameType) {
    this.id = id;
    this.gameType = gameType;
    this.players = new Set();
    this.nextPlayerId = 0;
    this.gameStarted = false;
    this.nextRanking;
    this.subscriptions = {};
  }

  static getGame(id) {
    if (GAMES.has(id)) return GAMES.get(id);

    return false;
  }

  static addGame(id, gameType) {
    if (!GAMES.has(id)) GAMES.set(id, new GameServer(id, gameType))

    return id;
  }

  checkGameStatus() {
    const full = this.players.size >= MAX_PLAYERS[this.gameType]; 

    return !full && !this.gameStarted;
  }

  join(player) {
    if (!this.checkGameStatus()) return false;

    if (this.players.size === 0) player.isHost = true;
    
    this.players.add(player);
    
    player.setId(++this.nextPlayerId);
    
    this.addSubscriptions(player)

    this.sendAll({ type: 'addPlayer', data: player.id });

    this.players.forEach(p => {
      (p !== player) && this.sendTo(player, { type: 'addPlayer', data: p.id, })
    });

    return true;
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
    this.players.forEach(player => this.sendTo(player,data));
  }

  sendAllExcept(exceptPlayer, data) {
    this.players.forEach(player =>
      (player !== exceptPlayer) && this.sendTo(player, data)
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
      
      this.sendTo(player, {
        type: 'addPieces',
        data: pieces
      })
    })
  }

  gameOver(data) {
    this.sendAll({
      type: 'gameOver',
      data: {
        id: data.id,
        board: data.board,
        message: this.gameOverMessage(data.id),
      }
    });

    this.nextRanking--;
  }

  gameOverMessage(id) {
    let message = {};

    if(this.gameType === GAME_TYPES.MULTI) {
      message.header = `${RANKINGS[this.nextRanking]} Place!`;
      message.body = [];

    } else if(this.gameType === GAME_TYPES.SINGLE) {
      const player = this.getPlayerById(id);
      
      message.header = 'Game Over!'
      message.body = [
        `Final Score: ${player.game.score}`,
        `Level: ${player.game.level}`,
        `Lines Cleared: ${player.game.lines}`,
      ];
    }
    
    return message;
  }

  getPlayerById(id) {
    let player;
    this.players.forEach(p => { if(p.id === id) player = p });
    return player;
  }

  unsubscribe() {
    Object.values(this.subscriptions)
      .forEach(p => p.forEach(unsub => unsub()));
  }
}

module.exports = GameServer;