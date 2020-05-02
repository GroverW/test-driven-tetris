const GameDOM = require('../static/js/gameDOM');
const { publish } = require('../pubSub');
const { getNewPlayer, getNewPlayerDOM } = require('../helpers/utils');
const { getMockDOMSelector, getMockCtx } = require('./helpers/testData');

describe('game DOM tests', () => {
  let gameDOM;
  let newCtx1, newBoard1, newId1;
  let newCtx2, newBoard2, newId2;
  let addPlayerSpy;

  beforeEach(() => {
    mockCtx = getMockCtx();
    mockCtxNext = getMockCtx();
    newCtx1 = getMockCtx();
    newId1 = 1;
    newId2 = 2;

    newPlayer1 = getNewPlayer(newCtx1, newBoard1, newId1);
    newPlayer2 = getNewPlayer(newCtx2, newBoard2, newId2);

    const selectors = {
      playerCtx: getMockCtx(),
      nextCtx: getMockCtx(),
      gameContainer: getMockDOMSelector(),
      scoreSelector: getMockDOMSelector(),
      levelSelector: getMockDOMSelector(),
      linesSelector: getMockDOMSelector()
    }

    gameDOM = new GameDOM(selectors);
    addPlayerSpy = jest.spyOn(gameDOM.gameView, 'addPlayer');

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    gameDOM.unsubAddP();
    gameDOM.unsubRemoveP();
  });

  test('start new game', () => {
    expect(gameDOM.gameContainer).not.toBe(undefined);
    expect(gameDOM.gameView).not.toBe(undefined);
    expect(gameDOM.scoreSelector).not.toBe(undefined);
    expect(gameDOM.levelSelector).not.toBe(undefined);
    expect(gameDOM.linesSelector).not.toBe(undefined);
    expect(gameDOM.players.length).toBe(0);
  })

  test('add player', () => {
    publish('addPlayer', newPlayer1.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.gameView.players.length).toBe(1);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(true);
  })

  test('add 3rd player resizes 2nd player', () => {
    publish('addPlayer', newPlayer1.id)

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(true);

    publish('addPlayer', newPlayer2.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(2);
    expect(gameDOM.players.length).toBe(2);
    expect(gameDOM.gameView.players.length).toBe(2);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(false);
    expect(gameDOM.players[0].selector.classList.contains('item-small')).toBe(true);
  })

  test('remove player', () => {
    publish('addPlayer', newPlayer1.id)
    
    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.gameView.players.length).toBe(1);

    publish('removePlayer', newPlayer1.id)

    expect(gameDOM.players.length).toBe(0);
    expect(gameDOM.gameView.players.length).toBe(0);
  });

  test('remove 3rd player resizes 2nd player', () => {
    publish('addPlayer', newPlayer1.id)

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(true);

    publish('addPlayer', newPlayer2.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(2);
    expect(gameDOM.players.length).toBe(2);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(false);
    expect(gameDOM.players[0].selector.classList.contains('item-small')).toBe(true);

    publish('removePlayer', newPlayer1.id);

    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.players[0].selector.classList.contains('item-large')).toBe(true);
    expect(gameDOM.players[0].selector.classList.contains('item-small')).toBe(false);
  });
});