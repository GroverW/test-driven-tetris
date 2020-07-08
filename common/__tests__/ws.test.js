const Player = require('backend/js/Player');
const { Piece } = require('common/js/Piece');
const ClientGame = require('frontend/static/js/ClientGame');
const Api = require('frontend/helpers/Api');

const serverPubSub = require('backend/helpers/pubSub');

const { CONTROLS } = require('frontend/helpers/clientConstants');
const { 
  GAMES,
  GAME_TYPES,
  POWER_UP_TYPES,
  PIECE_TYPES,
  COUNTDOWN,
} = require('backend/helpers/serverConstants');
const { MSG_TYPE } = require('common/helpers/commonTopics');

const { getMockDOMSelector, getMockGameDOMSelectors, runCommand, mockAnimation } = require('frontend/mockData/mocks');
const { MockServerListener, MockClientListener } = require('common/mockData/mockWSListeners');
const { mockSend, getTestBoard, webSocketMock, pubSubMock } = require('common/mockData/mocks');

const startGame = (clientToServer, ...additionalPlayers) => {
  additionalPlayers.forEach(player => clientToServer.gameServer.join(player));
      
  clientToServer.startGame();
  jest.advanceTimersByTime(COUNTDOWN.NUM_INTERVALS * COUNTDOWN.INTERVAL_LENGTH);
}

const getNewListeners = (clientListener, serverListener) => {
  if(clientListener !== undefined) clientListener.unsubAll();
  if(serverListener !== undefined) serverListener.unsubAll();

  const newClientListener = new MockClientListener(webSocketMock, getMockGameDOMSelectors());
  const newServerListener = new MockServerListener(webSocketMock, 1);

  return [newClientListener, newServerListener];
}

const getNewPlayer = () => new Player(mockSend, serverPubSub());

const resetAll = (clientListener, serverListener, ...players) => {
  ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));

  serverListener.open();

  players = players.map(player => getNewPlayer());

  startGame(clientListener, ...players);
}


describe('websocket tests', () => {
  let player2;
  let serverToClient;
  let clientToServer;
  let pubSubSpy;
  let api;

  beforeAll(() => {
    api = new Api(webSocketMock, 1);

    ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));

    player2 = getNewPlayer();
  });

  beforeEach(() => {
    WebSocket = jest.fn().mockImplementation(webSocketMock);
    api.sendMessage = jest.fn().mockImplementation(webSocketMock.send);

    pubSubSpy = pubSubMock();

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);

    jest.useFakeTimers();
    requestAnimationFrame = jest.fn().mockImplementation(mockAnimation());
  });

  afterEach(() => {
    jest.clearAllMocks();
    pubSubSpy.unsubscribeAll();
  });

  afterAll(() => {
    serverToClient.unsubAll();
    clientToServer.unsubAll();
    api.unsubscribe();
    GAMES.clear();
  })

  describe('joining / leaving game', () => {
    test('player opens WS connection', () => {
      clientToServer.open()
      expect(clientToServer.player).toEqual(expect.any(Player));
    });
  
    test('second player is added to room', () => {
      const sendAllSpy = jest.spyOn(clientToServer.gameServer, 'sendAll');
      const sendToSpy = jest.spyOn(clientToServer.gameServer, 'sendTo');
  
      // no additional players
      expect(serverToClient.gameDOM.players.length).toBe(0);
      expect(serverToClient.game.players.length).toBe(0);
      expect(sendAllSpy).toHaveBeenCalledTimes(0);
      expect(sendToSpy).toHaveBeenCalledTimes(0);
  
      clientToServer.gameServer.join(player2);
  
      // one additional player
      expect(serverToClient.gameDOM.players.length).toBe(1);
      expect(serverToClient.game.players.length).toBe(1);
  
      expect(sendAllSpy).toHaveBeenCalledTimes(1);
      // player joining should receive all other players in game
      // 2 calls for sendAll, 1 to send p1 info to p2
      expect(sendToSpy).toHaveBeenCalledTimes(3);
    });
  
    test('second player is removed from room', () => {
      expect(serverToClient.gameDOM.players.length).toBe(1);
      expect(serverToClient.gameDOM.gameView.players.length).toBe(1);
      expect(serverToClient.game.players.length).toBe(1);
  
      player2.leave();
  
      expect(serverToClient.gameDOM.players.length).toBe(0);
      expect(serverToClient.gameDOM.gameView.players.length).toBe(0);
      expect(serverToClient.game.players.length).toBe(0);
    });
  });
  
  describe('game start / game over', () => {
    test('should start game when initiated by client and add pieces to client and server', () => {
      const drawSpy = pubSubSpy.add('draw');

      // user will click button which will send newGame to server
      expect(serverToClient.game.gameStatus).toBe(false);
  
      startGame(clientToServer, player2);

      const serverPieces = clientToServer.player.game.board.pieceList.pieces;
      const clientPieces = serverToClient.game.board.pieceList.pieces;
  
      expect(clientPieces).not.toEqual([]);
      expect(serverPieces).toEqual(clientPieces);
  
      expect(clientToServer.gameServer.gameStarted).toBe(true);
      expect(serverToClient.game.gameStatus).toBe(true);
      expect(drawSpy).toHaveBeenCalledTimes(1);
    });
  
    test('subsequent game starts should fail', () => {
      const getPiecesSpy = jest.spyOn(serverToClient.game.board, 'getPieces');
  
      expect(getPiecesSpy).toHaveBeenCalledTimes(0);
  
      startGame(clientToServer, player2);
  
      expect(getPiecesSpy).toHaveBeenCalledTimes(0);
    });

    test('game over', () => {
      expect(serverToClient.game.gameStatus).toBe(true);
      expect(serverToClient.gameLoop.animationId).toEqual(expect.any(Number));
  
      const gameOverData = {
        id: clientToServer.player.id,
        board: clientToServer.player.game.board.grid
      }
  
      clientToServer.gameServer.gameOver(gameOverData);
  
      expect(serverToClient.game.gameStatus).toBe(null);
      expect(serverToClient.gameLoop.animationId).toBe(undefined);
    });

    test('game started - remove game after last player leaves', () => {
      // this would be caused by player closing their browser or leaving the page
      ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));
      clientToServer.open();
      
      player2 = getNewPlayer();
      startGame(clientToServer, player2);
  
      const startingClientBoard = JSON.parse(JSON.stringify(serverToClient.game.board.grid));

      runCommand(serverToClient.game, CONTROLS.DOWN);
      runCommand(serverToClient.game, CONTROLS.LEFT);
      runCommand(serverToClient.game, CONTROLS.ROTATE_RIGHT);
      runCommand(serverToClient.game, CONTROLS.AUTO_DOWN);
      runCommand(serverToClient.game, CONTROLS.HARD_DROP);
      
      const serverBoard = clientToServer.player.game.board.grid;
      const clientBoard = serverToClient.game.board.grid;
      
      expect(startingClientBoard).not.toEqual(clientBoard);
      expect(serverBoard).toEqual(clientBoard);
  
      clientToServer.player.leave();
      player2.leave();
  
      expect(GAMES.has(clientToServer.gameServer.id)).toBe(false);
    });
  });

  describe('gameplay', () => {
    test('execute commands', () => {
      ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));
      clientToServer.open();

      player2 = getNewPlayer();
      startGame(clientToServer, player2);

      const startingClientBoard = JSON.parse(JSON.stringify(serverToClient.game.board.grid));

      runCommand(serverToClient.game, CONTROLS.DOWN);

      runCommand(serverToClient.game, CONTROLS.LEFT);
      runCommand(serverToClient.game, CONTROLS.ROTATE_RIGHT);
      runCommand(serverToClient.game, CONTROLS.HARD_DROP);

      const serverBoard = clientToServer.player.game.board.grid;
      const clientBoard = serverToClient.game.board.grid;
      
      expect(startingClientBoard).not.toEqual(clientBoard);
      expect(serverBoard).toEqual(clientBoard);
  
      runCommand(serverToClient.game, CONTROLS.LEFT);
      runCommand(serverToClient.game, CONTROLS.ROTATE_LEFT);
      runCommand(serverToClient.game, CONTROLS.HARD_DROP);

      expect(serverBoard).toEqual(clientBoard);
      expect(clientToServer.player.game.score).toEqual(serverToClient.game.score);
    });
  
    test('execute commands - player 2 board updates on player 1 DOM', () => {      
      const drawGridSpy = jest.spyOn(serverToClient.gameDOM.gameView, 'drawGrid');
      
      expect(drawGridSpy).toHaveBeenCalledTimes(0);
  
      player2.game.board.grid = getTestBoard('pattern1');
      player2.game.executeCommandQueue([]);
  
      expect(drawGridSpy).toHaveBeenCalledTimes(1);
    });
  
    test('game over from play', () => {
      for (let i = 0; i < 25; i++) {
        runCommand(serverToClient.game, CONTROLS.HARD_DROP);
      }
  
      const serverBoard = clientToServer.player.game.board.grid;
      const clientBoard = serverToClient.game.board.grid;

      expect(serverBoard).toEqual(clientBoard);
  
      expect(serverToClient.game.gameStatus).toBe(null);
      expect(clientToServer.player.game.gameStatus).toBe(null);
    });
  });
  
  describe('power ups', () => {
    test('power up is added to client when rewarded to server', () => {
      Math.random = jest.fn().mockReturnValue(.9);
  
      ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));
      clientToServer.open();
      
      player2 = getNewPlayer();
      let player3 = getNewPlayer();

      startGame(clientToServer, player2, player3);


      expect(clientToServer.player.game.powerUps.length).toBe(0);
      expect(serverToClient.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);
      
      clientToServer.player.game.clearLines(1);
  
      expect(clientToServer.player.game.powerUps.length).toBe(1);
      expect(serverToClient.gameDOM.powerUps.filter((p) => p.type).length).toBe(1);
    });
  
    test('server side updates client side board', () => {
      Math.random = jest.fn().mockReturnValue(0);
      
      clientToServer.player.game.powerUps[0] = POWER_UP_TYPES.SWAP_LINES;
  
      clientToServer.player.game.board.grid = getTestBoard('pattern1');
      serverToClient.game.board.grid = getTestBoard('pattern1');
      player2.game.board.grid = getTestBoard('pattern2');
  
      const serverBoardBefore = clientToServer.player.game.board.grid;
      const clientBoardBefore = serverToClient.game.board.grid;
  
      expect(serverBoardBefore).toEqual(getTestBoard('pattern1'));
      expect(clientBoardBefore).toEqual(getTestBoard('pattern1'));
  
      clientToServer.player.game.usePowerUp(player2.id);
  
      const serverBoardAfter = clientToServer.player.game.board.grid;
      const clientBoardAfter = serverToClient.game.board.grid;
  
      expect(serverBoardAfter).toEqual(getTestBoard('empty'));
      expect(clientBoardAfter).toEqual(getTestBoard('empty'));
      expect(player2.game.board.grid).toEqual(getTestBoard('pattern1SwappedWith2'));
    });
  
    test('should not add if single player', () => {
      Math.random = jest.fn().mockReturnValue(.9);

      clientToServer.gameServer.gameType = GAME_TYPES.SINGLE;
      clientToServer.player.setGameType(GAME_TYPES.SINGLE);
  
      serverToClient.gameDOM.usePowerUp();
      serverToClient.gameDOM.usePowerUp();

      expect(clientToServer.player.game.powerUps.length).toBe(0);
      expect(serverToClient.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);
  
      clientToServer.player.game.clearLines(1);
  
      expect(clientToServer.player.game.powerUps.length).toBe(0);
      expect(serverToClient.gameDOM.powerUps.filter((p) => p.type).length).toBe(0);
    });
  });

  describe('error messages', () => {
    test('send error message', () => {
      const errorSpy = pubSubSpy.add('addMessage');
      const errorText = 'test';

      expect(errorSpy).not.toHaveBeenCalled();
      expect(serverToClient.clientMessage.message.innerText).toBe('');
      
      clientToServer.gameServer.sendMessage(clientToServer.player, MSG_TYPE.ERROR, errorText);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(serverToClient.clientMessage.message.innerText).toBe(errorText);
    });

    test('start game - not enough players', () => {
      const errorSpy = pubSubSpy.add('addMessage');
  
      ([serverToClient, clientToServer] = getNewListeners(serverToClient, clientToServer));
      clientToServer.open();

      expect(errorSpy).not.toHaveBeenCalled();
      expect(serverToClient.clientMessage.message.innerText).toBe('');
      
      clientToServer.startGame();
      
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(serverToClient.clientMessage.message.innerText).not.toBe('');

      clientToServer.gameServer.join(player2);

      clientToServer.startGame();

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});