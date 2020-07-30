const {
  GAMES,
  GAME_TYPES,
  MAX_PLAYERS,
  SEED_PIECES,
  COUNTDOWN,
} = require('backend/helpers/serverConstants');
const {
  MSG_TYPE,
  ADD_PLAYER,
  REMOVE_PLAYER,
  UPDATE_PLAYER,
  PLAY,
  GAME_MESSAGE,
  START_GAME,
  GAME_OVER,
  END_GAME,
  GET_PIECES,
  ADD_PIECES,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('backend/helpers/serverTopics');
const {
  randomize, multiPlayerGameOverMessage, singlePlayerGameOverMessage,
} = require('backend/helpers/serverUtils');
const { handlePowerUp } = require('backend/helpers/powerUps');

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
    this.players = [];
    this.nextPlayerId = 0;
    this.gameStarted = false;
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
    if (!GAMES.has(id)) GAMES.set(id, new GameServer(id, gameType));

    return id;
  }

  /**
   * Checks whether gameServer is full or game is already started
   * @returns {boolean} - whether gameServer has space and game is not already started
   */
  checkGameStatus(player) {
    const full = this.players.length >= MAX_PLAYERS[this.gameType];

    if (full) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game is full.');
    }

    if (this.gameStarted) {
      player.sendFlash(MSG_TYPE.ERROR, 'That game has already started.');
    }

    return !full && !this.gameStarted;
  }

  /**
   * Adds player to an existing gameServer
   * @param {object} player - instance of Player class
   * @returns {boolean} - whether or not player was added successfully
   */
  join(player) {
    if (!this.checkGameStatus(player)) return false;
    if (this.players.includes(player)) return false;

    this.nextPlayerId += 1;
    player.setId(this.nextPlayerId);
    player.setGameType(this.gameType);

    this.players.push(player);
    this.addSubscriptions(player);

    // send new player to existing players
    this.sendAll({ type: ADD_PLAYER, data: player.id });

    // send existing players to new player
    this.players.forEach((p) => {
      if (p !== player) player.sendMessage({ type: ADD_PLAYER, data: p.id });
    });

    this.setHostOnJoin();

    return true;
  }

  /**
   * Subscribes gameServer to specified player's publish/subscribe object
   * @param {object} player - instance of Player class
   */
  addSubscriptions(player) {
    this.subscriptions[player.id] = [
      player.pubSub.subscribe(REMOVE_PLAYER, this.leave.bind(this)),
      player.pubSub.subscribe(PLAY, this.playerReady.bind(this)),
      player.pubSub.subscribe(GAME_OVER, this.gameOver.bind(this)),
      player.pubSub.subscribe(GET_PIECES, this.getPieces.bind(this)),
      player.pubSub.subscribe(UPDATE_PLAYER, this.updatePlayer.bind(this)),
      player.pubSub.subscribe(ADD_POWER_UP, this.addPowerUp.bind(this)),
      player.pubSub.subscribe(USE_POWER_UP, this.executePowerUp.bind(this)),
    ];
  }

  /**
   * Unsubscribes gameServer from specified player's publish/subscribe object
   * @param {number} id - player id
   */
  removeSubscriptions(id) {
    this.subscriptions[id].forEach((unsub) => unsub());
  }

  /**
   * Removes specified player from gameServer
   * @param {object} player - instance of Player class
   * @returns {boolean} - whether or not player was removed
   */
  leave(player) {
    if (!this.removePlayer(player)) return false;
    this.sendAll({ type: REMOVE_PLAYER, data: player.id });

    if (!this.players.length) GAMES.delete(this.id);

    this.nextRanking -= 1;
    this.checkIfWinner();
    this.setHostOnLeave();

    return true;
  }

  /**
   * Removes player from player list
   * @param {object} player - instance of player class
   * @returns {boolean} - whether or not removal was successful
   */
  removePlayer(player) {
    if (!this.players.includes(player)) return false;

    this.removeSubscriptions(player.id);
    this.players = this.players.filter((p) => p !== player);

    return true;
  }

  setHostOnJoin() {
    const player1 = this.players[0];
    player1.isHost = true;
  }

  /**
   * Sets the first player to be the host
   */
  setHostOnLeave() {
    const player1 = this.players[0];

    if (player1 && !player1.isHost) {
      player1.isHost = true;
      player1.sendFlash(MSG_TYPE.NOTICE, 'You are now the host');
    }
  }

  /**
   * Sends message over websocket to each player
   * @param {object} data - type of message and data to send
   */
  sendAll(data) {
    this.players.forEach((player) => player.sendMessage(data));
  }

  /**
   * Sends message to all players except specified player
   * @param {object} exceptPlayer - player to exclude from sending
   * @param {object} data - type of message and data to send
   */
  sendAllExcept(exceptPlayer, data) {
    this.players.forEach((player) => {
      if (player !== exceptPlayer) player.sendMessage(data);
    });
  }

  /**
   * Sends message to all players to update the board for the specified player
   * @param {object} data - data to send
   * @param {number} data.id - id of player to update
   * @param {number[][]} data.board - player board to update
   */
  updatePlayer(data, includePlayer = false) {
    const { id, board } = data;
    const sendData = {
      type: UPDATE_PLAYER,
      data: { id, board },
    };

    if (includePlayer) {
      this.sendAll(sendData);
    } else {
      this.sendAllExcept(this.getPlayerById(id), sendData);
    }
  }

  /**
   * Sends power up to client
   * @param {object} data - id of player and power up
   * @param {number} data.id - id of player
   * @param {number} data.powerUp - id of power up
   */
  addPowerUp(data) {
    const player = this.getPlayerById(data.id);
    if (player) {
      player.sendMessage({
        type: ADD_POWER_UP,
        data: data.powerUp,
      });
    }
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

      const [result1, result2] = handlePowerUp(data.powerUp, board1, board2);

      if (result1) {
        player1.game.board.replaceBoard(result1);
        this.updatePlayer({ id: data.player1, board: result1 }, true);
      }
      if (result2) {
        player2.game.board.replaceBoard(result2);
        this.updatePlayer({ id: data.player2, board: result2 }, true);
      }
    }
  }

  /**
   * Sets player to readyToPlay. Starts game when all players ready
   * @param {object} player - player who is ready
   */
  playerReady(player) {
    player.updateReadyState(true);
    const totalReady = this.players.filter((p) => p.readyToPlay).length;

    if (this.checkStartConditions(totalReady)) {
      this.animateStart();
    } else {
      this.sendGameMessage(
        'Waiting for others',
        [
          `${totalReady} out of ${this.players.length} players ready`,
          `Game ID: ${this.id}`,
        ],
      );
    }
  }

  /**
   * Animates the countdown for game start
   */
  animateStart() {
    let currInterval = COUNTDOWN.NUM_INTERVALS;

    const animate = () => setTimeout(() => {
      currInterval -= 1;

      if (currInterval > 0) {
        this.sendGameMessage(currInterval);
        animate();
      } else if (currInterval === 0) {
        this.sendGameMessage('Good Luck!');
        animate();
      } else {
        this.startGame();
      }
    }, COUNTDOWN.INTERVAL_LENGTH * (currInterval < COUNTDOWN.NUM_INTERVALS));

    animate();
  }

  /**
   * Starts game
   */
  startGame() {
    this.gameStarted = true;

    this.getPieces();

    this.players.forEach((p) => p.game.start());

    this.sendAll({ type: START_GAME });

    this.nextRanking = this.players.length;
  }

  /**
   * Checks whether or not the game can be started
   * @param {object} player - instance of player class
   * @returns {boolean} - whether or not game can be started
   */
  checkStartConditions(totalReady) {
    if (
      this.gameType === GAME_TYPES.MULTI
      && this.players.length === 1
      && totalReady === 1
    ) {
      this.players[0].sendFlash(MSG_TYPE.ERROR, 'Not enough players to start game.');
      return false;
    }

    if (this.gameType === GAME_TYPES.SINGLE && totalReady > 0) return true;

    if (totalReady < this.players.length) return false;

    return true;
  }

  /**
   * Sends message to all players to add a new pieceList
   */
  getPieces() {
    const pieces = randomize(SEED_PIECES);

    this.players.forEach((player) => player.pubSub.publish(ADD_PIECES, pieces));

    this.sendAll({ type: ADD_PIECES, data: pieces });
  }

  /**
   * Sends Game Over message to all players when a player's game has ended
   * @param {object} data - data to send
   * @param {number} data.id - id of player
   * @param {number[][]} data.board - player's board
   */
  gameOver(data) {
    this.sendAll({
      type: GAME_OVER,
      data: {
        id: data.id,
        board: data.board,
        message: this.gameOverMessage(data.id),
      },
    });

    this.nextRanking -= 1;
    this.checkIfWinner();
  }

  /**
   * Checks if a win condition has been reached
   */
  checkIfWinner() {
    if (!this.gameStarted) return;

    const remaining = this.players.filter((p) => p.game.gameStatus);

    if (remaining.length === 1) {
      const winner = remaining[0];
      winner.pubSub.publish(GAME_OVER, {
        id: winner.id,
        board: winner.game.board.grid,
      });
      this.endGame();
    } else if (this.gameType === GAME_TYPES.SINGLE) this.endGame();
  }

  endGame() {
    this.sendAll({ type: END_GAME, data: {} });
  }

  /**
   * Generates a Game Over message for a specified player
   * @param {number} id - player id
   * @returns {object} - message header and body
   */
  gameOverMessage(id) {
    if (this.gameType === GAME_TYPES.MULTI) {
      return multiPlayerGameOverMessage(this.nextRanking);
    }

    const player = this.getPlayerById(id);
    return singlePlayerGameOverMessage(player);
  }

  sendGameMessage(header, body = []) {
    this.sendAll({
      type: GAME_MESSAGE,
      data: { header, body },
    });
  }

  /**
   * Gets a player instance by their id
   * @param {number} id - player id
   * @returns {object} - player instance
   */
  getPlayerById(id) {
    return this.players.find((p) => p.id === id);
  }

  /**
   * Unsubscribe's the gameServer from all players' publish/subscribe objects
   */
  unsubscribe() {
    Object.values(this.subscriptions)
      .forEach((p) => p.forEach((unsub) => unsub()));
  }
}

module.exports = GameServer;
