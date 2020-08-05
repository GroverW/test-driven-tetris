const MessageManager = require('backend/js/MessageManager');
const PlayerManager = require('backend/js/PlayerManager');
const { GAME_TYPES } = require('common/constants');
const {
  GAME_MESSAGE, ADD_POWER_UP, ADD_PLAYER, UPDATE_PLAYER,
} = require('backend/topics');
const {
  multiPlayerGameOverMessage, singlePlayerGameOverMessage,
} = require('backend/helpers/serverUtils');

describe('message manager tests', () => {
  let playerManager;
  let messageManager;
  let p1; let p2;

  const getTestPlayer = (id) => ({
    id,
    game: {},
    sendMessage: jest.fn(),
  });

  beforeEach(() => {
    playerManager = new PlayerManager();
    messageManager = new MessageManager(GAME_TYPES.MULTI, playerManager);
    p1 = getTestPlayer(1);
    p2 = getTestPlayer(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send messages', () => {
    let testMessage;

    beforeEach(() => {
      testMessage = 'test';
      playerManager.add(p1);
      playerManager.add(p2);
    });

    test('sendAll sends message to all players', () => {
      messageManager.sendAll(testMessage);

      expect(p1.sendMessage).toHaveBeenCalledTimes(1);
      expect(p1.sendMessage).toHaveBeenLastCalledWith(testMessage);
      expect(p2.sendMessage).toHaveBeenCalledTimes(1);
      expect(p2.sendMessage).toHaveBeenLastCalledWith(testMessage);
    });

    test('sendAllExcept sends message to all players except specified player', () => {
      messageManager.sendAllExcept(p2, testMessage);

      expect(p1.sendMessage).toHaveBeenCalledTimes(1);
      expect(p1.sendMessage).toHaveBeenLastCalledWith(testMessage);
      expect(p2.sendMessage).toHaveBeenCalledTimes(0);
    });

    test('getGameOverMessage returns a different message depending on game type', () => {
      expect(messageManager.getGameOverMessage(p1)).toEqual(multiPlayerGameOverMessage());

      messageManager.gameType = GAME_TYPES.SINGLE;

      expect(messageManager.getGameOverMessage(p1)).toEqual(singlePlayerGameOverMessage(p1));

      messageManager.gameType = '';

      expect(messageManager.getGameOverMessage(p1)).toEqual(null);
    });

    test('sendGameOverMessage sends game over message to all players', () => {
      const ranking = 1;

      messageManager.sendGameOverMessage(p1.id, [], ranking);

      expect(p1.sendMessage).toHaveBeenCalledTimes(1);
      expect(p2.sendMessage).toHaveBeenCalledTimes(1);
      expect(p1.sendMessage).toHaveBeenLastCalledWith({
        type: expect.any(String),
        data: expect.any(Object),
      });
    });

    test('sendGameMessage sends game message to all players', () => {
      const sendAllSpy = jest.spyOn(messageManager, 'sendAll');
      messageManager.sendGameMessage();

      expect(sendAllSpy).toHaveBeenLastCalledWith({
        type: GAME_MESSAGE,
        data: expect.any(Object),
      });
    });

    test('sendPowerUp sends add power up message to specified player', () => {
      messageManager.sendPowerUp({ id: p1.id, powerUp: 1 });

      expect(p1.sendMessage).toHaveBeenLastCalledWith({
        type: ADD_POWER_UP,
        data: 1,
      });
    });

    test('sendPlayerUpdate sends message for all to update player', () => {
      const sendAllSpy = jest.spyOn(messageManager, 'sendAll');
      const data = { id: p1.id, board: p1.game.board };
      messageManager.sendPlayerUpdate(data);

      expect(sendAllSpy).toHaveBeenLastCalledWith({ type: UPDATE_PLAYER, data });
    });

    test('sendPlayerUpdateToOthers sends message for all others to update player', () => {
      const sendAllExceptSpy = jest.spyOn(messageManager, 'sendAllExcept');
      const data = { id: p1.id, board: p1.game.board };
      messageManager.sendPlayerUpdateToOthers(data);

      expect(sendAllExceptSpy).toHaveBeenLastCalledWith(p1, { type: UPDATE_PLAYER, data });
    });

    test('addOtherPlayersTo sends all other players for specified player to adad', () => {
      const p3 = getTestPlayer(3);
      const sendMessageSpy = jest.spyOn(p3, 'sendMessage');

      playerManager.add(p3);

      messageManager.addOtherPlayersTo(p3);

      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
      expect(sendMessageSpy).toHaveBeenLastCalledWith({ type: ADD_PLAYER, data: p2.id });
    });
  });
});
