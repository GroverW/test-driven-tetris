const PlayerManager = require('backend/js/PlayerManager');

describe('player manager tests', () => {
  let playerManager;
  let p1; let p2;

  const getTestPlayer = (id) => ({
    id,
    game: {},
    sendMessage: jest.fn(),
  });

  beforeEach(() => {
    playerManager = new PlayerManager();
    p1 = getTestPlayer(1);
    p2 = getTestPlayer(2);
  });

  describe('add / remove players', () => {
    test('adds player', () => {
      expect(playerManager.playerList.length).toBe(0);

      expect(playerManager.add(p1)).toBe(true);
      expect(playerManager.playerList.length).toBe(1);
    });

    test('does not add same player twice', () => {
      playerManager.add(p1);

      expect(playerManager.add(p1)).toBe(false);
      expect(playerManager.playerList.length).toBe(1);
    });

    test('removes player', () => {
      playerManager.add(p1);

      expect(playerManager.playerList.length).toBe(1);

      expect(playerManager.remove(p1)).toBe(true);
      expect(playerManager.playerList.length).toBe(0);
    });

    test('only removes player if player matches', () => {
      playerManager.add(p1);

      expect(playerManager.remove(p2)).toBe(false);
      expect(playerManager.playerList.length).toBe(1);

      expect(playerManager.remove(p1)).toBe(true);
      expect(playerManager.playerList.length).toBe(0);
    });
  });

  describe('get players', () => {
    beforeEach(() => {
      playerManager.add(p1);
      playerManager.add(p2);
    });

    test('gets player list', () => {
      expect(playerManager.list).toEqual([p1, p2]);
    });

    test('gets count of players', () => {
      expect(playerManager.count).toBe(2);
    });

    test('gets first player', () => {
      expect(playerManager.first).toBe(p1);
    });

    test('gets player by id', () => {
      expect(playerManager.getById(p1.id)).toBe(p1);
    });
  });
});
