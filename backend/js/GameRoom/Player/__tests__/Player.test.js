const Player = require('backend/js/GameRoom/Player');
const ServerGame = require('backend/js/GameRoom/Player/ServerGame');
const pubSub = require('backend/helpers/pubSub');
const { mockSend, pubSubMock } = require('common/mocks');
const { GAME_TYPES } = require('backend/constants');
const {
  MSG_TYPE, ADD_MESSAGE, REMOVE_PLAYER, PLAY, ADD_PIECES, GAME_OVER,
} = require('backend/topics');

describe('player tests', () => {
  let p1;
  let pubSubTest;
  let pubSubSpy;
  let testMessage;

  beforeEach(() => {
    pubSubTest = pubSub();
    p1 = new Player(mockSend(), pubSubTest);
    pubSubSpy = pubSubMock(pubSubTest);
    testMessage = { type: 'test', data: 'test' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setup player', () => {
    const {
      isHost, readyToPlay, send, pubSub: pubSubObj, game,
    } = p1;
    expect([isHost, readyToPlay, send, pubSubObj, game])
      .toEqual([false, false, expect.any(Function), expect.any(Object), expect.any(ServerGame)]);
  });

  test('sends messages', () => {
    const sendSpy = jest.spyOn(p1, 'send');

    p1.sendMessage(testMessage);

    expect(sendSpy).toHaveBeenLastCalledWith(JSON.stringify(testMessage));
  });

  test('sends flash', () => {
    const sendMessageSpy = jest.spyOn(p1, 'sendMessage');

    p1.sendFlash(MSG_TYPE.NOTICE, testMessage.data);

    expect(sendMessageSpy).toHaveBeenLastCalledWith({
      type: ADD_MESSAGE,
      data: {
        type: MSG_TYPE.NOTICE,
        message: testMessage.data,
      },
    });
  });

  test('updates ready state', () => {
    p1.updateReadyState(true);
    expect(p1.readyToPlay).toBe(true);
  });

  test('sets id', () => {
    expect(p1.id).toBe(undefined);

    p1.setId(1);

    expect([p1.id, p1.game.playerId, p1.game.board.playerId]).toEqual([1, 1, 1]);
  });

  test('sets game type', () => {
    expect(p1.game.gameType).toBe(undefined);
    p1.setGameType(GAME_TYPES.MULTI);
    expect(p1.game.gameType).toBe(GAME_TYPES.MULTI);
  });

  test('publishes REMOVE_PLAYER on leave', () => {
    const removePlayerSpy = pubSubSpy.add(REMOVE_PLAYER);
    p1.leave();
    expect(removePlayerSpy).toHaveBeenLastCalledWith(p1);
  });

  test('startGame publishes PLAY if game not over', () => {
    const playSpy = pubSubSpy.add(PLAY);
    const updateReadyStateSpy = jest.spyOn(p1, 'updateReadyState');

    p1.startGame();

    expect(playSpy).toHaveBeenLastCalledWith(p1);
    expect(updateReadyStateSpy).toHaveBeenCalledTimes(1);

    p1.game.gameStatus = null;
    p1.startGame();

    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(updateReadyStateSpy).toHaveBeenCalledTimes(1);
  });

  test('execute calls executeCommandQueue', () => {
    const commands = [];
    const executeSpy = jest.spyOn(p1.game, 'executeCommandQueue');

    p1.game.gameStatus = true;
    p1.execute(commands);

    expect(executeSpy).toHaveBeenLastCalledWith(commands);
  });

  test('endGame ends the current game if not already ended', () => {
    const gameOverSpy = pubSubSpy.add(GAME_OVER);
    const gameOverActionSpy = jest.spyOn(p1.game, 'gameOverAction');

    p1.game.gameStatus = true;

    p1.gameOver();

    expect(gameOverSpy).toHaveBeenLastCalledWith({
      id: p1.id, grid: expect.any(Array),
    });
    expect(gameOverActionSpy).toHaveBeenCalledTimes(1);
    expect(p1.game.gameStatus).toBe(null);

    p1.gameOver();

    expect(gameOverActionSpy).toHaveBeenCalledTimes(1);
    expect(gameOverSpy).toHaveBeenCalledTimes(1);
  });

  test('addPieces adds pieces to game', () => {
    const addPiecesSpy = jest.spyOn(p1.game, ADD_PIECES);
    const testPieces = [1, 1, 1, 1];

    p1.addPieces(testPieces);

    expect(addPiecesSpy).toHaveBeenLastCalledWith(testPieces);
  });
});
