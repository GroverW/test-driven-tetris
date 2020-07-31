const GameManager = require('backend/js/GameManager');

describe('game manager tests', () => {
  let gameManager;
  let p1; let p2;

  beforeEach(() => {
    p1 = jest.fn();
    p2 = jest.fn();
    gameManager = new GameManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add / remove players', () => {
    test('adds player', () => {
      expect(gameManager.players.length).toBe(0);

      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);
    });

    test('does not add same player twice', () => {
      gameManager.addPlayer(p1);
      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);
    });

    test('removes player', () => {
      gameManager.addPlayer(p1);

      expect(gameManager.players.length).toBe(1);

      gameManager.removePlayer(p1);

      expect(gameManager.players.length).toBe(0);
    });

    test('only removes player if player matches', () => {
      gameManager.addPlayer(p1);
      gameManager.removePlayer(p2);

      expect(gameManager.players.length).toBe(1);

      gameManager.removePlayer(p1);

      expect(gameManager.players.length).toBe(0);
    });
  });
});
