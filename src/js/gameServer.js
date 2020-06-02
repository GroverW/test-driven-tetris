const {
  GAMES,
  GAME_TYPES,
  MAX_PLAYERS,
  POWER_UP_TYPES,
  RANKINGS,
  SEED_PIECES
} = require('backend/helpers/serverConstants');
const { randomize } = require('common/helpers/utils');
const powerUps = require('backend/helpers/powerUps');


/**
 * Represents a game server
 */
class GameServer {
  /**
   * @constructor
   * @param {string} id - id of specified game server
   * @param {string} gameType - single player or multiplayer game
   */
  constructor(id, gameType) {
    this.id = id;
    this.gameType = gameType;
    this.players = new Set();
    this.nextPlayerId = 0;
    this.gameStarted = false;
    this.nextRanking;
    this.subscriptions = {};
  }

  /**
   * Gets a specified gameServer instance
   * @param {string} id - id of game to get
   * @returns {object|boolean} - either a gameServer or false if not found
   */
  static getGame(id) {
    if (GAMES.has(id)) return GAMES.get(id);

    return false;
  }

  /**
   * Adds a new game if id does not already exist
   * @param {string} id - id of game to add
   * @param {string} gameType - type of game to add (single or multiplayer)
   * @returns {string} - id of new game
   */
  static addGame(id, gameType) {
    if (!GAMES.has(id)) GAMES.set(id, new GameServer(id, gameType))

    return id;
  }

  /**
   * Checks whether gameServer is full or game is already started
   * @returns {boolean} - whether gameServer has space and game is not already started
   */
  checkGameStatus() {
    const full = this.players.size >= MAX_PLAYERS[this.gameType];

    return !full && !this.gameStarted;
  }

  /**
   * Adds player to an existing gameServer
   * @param {object} player - instance of Player class
   * @returns {boolean} - whether or not player was added successfully
   */
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

  /**
   * Subscribes gameServer to specified player's publish/subscribe object
   * @param {object} player - instance of Player class
   */
  addSubscriptions(player) {
    this.subscriptions[player.id] = [
      player.pubSub.subscribe('leave', this.leave.bind(this)),
      player.pubSub.subscribe('startGame', this.startGame.bind(this)),
      player.pubSub.subscribe('gameOver', this.gameOver.bind(this)),
      player.pubSub.subscribe('getPieces', this.getPieces.bind(this)),
      player.pubSub.subscribe('updatePlayer', this.updatePlayer.bind(this)),
      player.pubSub.subscribe('usePowerUp', this.executePowerUp.bind(this)),
    ]
  }

  /**
   * Unsubscribes gameServer from specified player's publish/subscribe object
   * @param {number} id - player id
   */
  removeSubscriptions(id) {
    this.subscriptions[id].forEach(unsub => unsub());
  }

  /**
   * Removes specified player from gameServer
   * @param {object} player - instance of Player class
   * @returns {boolean} - whether or not player was removed
   */
  leave(player) {
    if (this.players.has(player)) {
      if (player.isHost && this.players.size > 1) this.setNewHost()

      this.removeSubscriptions(player.id);
      this.players.delete(player);

      if (this.players.size === 0) {
        GAMES.delete(this.id);
      } else {
        this.sendAllExcept(player, {
          type: 'removePlayer',
          data: player.id
        });

        this.nextRanking--;
        this.checkIfWinner();
      }

      return true;
    }

    return false;
  }

  /**
   * Sets next player to be host
   */
  setNewHost() {
    const playersIterator = this.players.values();
    playersIterator.next()
    const newHost = playersIterator.next().value;
    newHost.isHost = true;
  }

  /**
   * Sends message over websocket to each player
   * @param {object} data - type of message and data to send
   */
  sendAll(data) {
    this.players.forEach(player => this.sendTo(player, data));
  }

  /**
   * Sends message to all players except specified player
   * @param {object} exceptPlayer - player to exclude from sending
   * @param {object} data - type of message and data to send
   */
  sendAllExcept(exceptPlayer, data) {
    this.players.forEach(player =>
      (player !== exceptPlayer) && this.sendTo(player, data)
    );
  }

  /**
   * Sends message to specified player
   * @param {object} player - player to send message to
   * @param {object} data - type of message and data to send
   */
  sendTo(player, data) {
    player._send(JSON.stringify(data));
  }

  /**
   * Starts game
   * @param {object} player - Player requesting to start game
   */
  startGame(player) {
    if (player && player.isHost) {
      this.gameStarted = true;

      this.getPieces();

      this.players.forEach(p => p.game.start());

      this.sendAll({
        type: 'startGame',
      });

      this.nextRanking = this.players.size;
    }
  }

  /**
   * Sends message to all players to update the board for the specified player
   * @param {object} data - data to send
   * @param {number} data.id - id of player to update
   * @param {array} data.board - player board to update
   */
  updatePlayer(data, include=false) {
    const sendData = {
      type: 'updatePlayer',
      data: {
        id: data.id,
        board: data.board,
      }
    }
    
    include
      ? this.sendAll(sendData)
      : this.sendAllExcept(this.getPlayerById(data.id), sendData)
  }

  /**
   * Executes power up
   * @param {object} data - source player, target players, and power up type
   * @param {number} data.player1 - source player id
   * @param {number} data.player2 - target player id
   * @param {number} data.powerUp - power up id
   */
  executePowerUp(data) {
    const player1 = this.getPlayerById(data.player1);
    const player2 = this.getPlayerById(data.player2);

    if (player1 && player2) {
      const board1 = player1.game.board.grid;
      const board2 = player2.game.board.grid;
      let result1, result2;

      switch (data.powerUp) {
        case POWER_UP_TYPES.SWAP_LINES:
          [result1, result2] = powerUps.swapLines(board1, board2);
          player1.game.board.replaceBoard(result1);
          player2.game.board.replaceBoard(result2);
          break;
        case POWER_UP_TYPES.SWAP_BOARDS:
          [result1, result2] = powerUps.swapBoards(board1, board2);
          player1.game.board.replaceBoard(result1);
          player2.game.board.replaceBoard(result2);
          break;
        case POWER_UP_TYPES.SCRAMBLE_BOARD:
          result2 = powerUps.scrambleBoard(board2);
          player2.game.board.replaceBoard(result2);
          break;
        case POWER_UP_TYPES.CLEAR_BOARD:
          result2 = powerUps.clearBoard(board2);
          player2.game.board.replaceBoard(result2);
          break;
        default:
          break;
      }
      result1 && this.updatePlayer({ id: data.player1, board: result1 }, true);
      result2 && this.updatePlayer({ id: data.player2, board: result2 }, true);
    }
  }

  /**
   * Sends message to all players to add a new pieceList
   */
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

  /**
   * Sends Game Over message to all players when a player's game has ended
   * @param {object} data - data to send
   * @param {number} data.id - id of player
   * @param {array} data.board - player's board
   */
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
    this.checkIfWinner();
  }

  /**
   * Checks if a win condition has been reached
   */
  checkIfWinner() {
    if (!this.gameStarted) return;

    let count = this.players.size;
    let winner = false;

    this.players.forEach(p => {
      if (p.game.gameStatus) winner = p;
      else count--;
    });

    if (count === 1) {
      winner.pubSub.publish('gameOver', {
        id: winner.id,
        board: winner.game.board.grid,
      })
    }
  }

  /**
   * Generates a Game Over message for a specified player
   * @param {number} id - player id
   * @returns {object} - message header and body
   */
  gameOverMessage(id) {
    let message = {};

    if (this.gameType === GAME_TYPES.MULTI) {
      message.header = `${RANKINGS[this.nextRanking]} Place!`;
      message.body = [];

    } else if (this.gameType === GAME_TYPES.SINGLE) {
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

  /**
   * Gets a player instance by their id
   * @param {number} id - player id
   * @returns {object} - player instance
   */
  getPlayerById(id) {
    let player;
    this.players.forEach(p => { if (p.id === id) player = p });
    return player;
  }

  /**
   * Unsubscribe's the gameServer from all players' publish/subscribe objects
   */
  unsubscribe() {
    Object.values(this.subscriptions)
      .forEach(p => p.forEach(unsub => unsub()));
  }
}

module.exports = GameServer;