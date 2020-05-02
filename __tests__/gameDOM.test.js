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
      scoreSelector: getMockDOMSelector(),
      levelSelector: getMockDOMSelector(),
      linesSelector: getMockDOMSelector()
    }

    gameDOM = new GameDOM(selectors);
    addPlayerSpy = jest.spyOn(gameDOM, 'addPlayer');
    document.getElementById = jest.fn().mockReturnValue(getMockDOMSelector());
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    publish('addPlayer', newPlayer1);

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players.length).toBe(1);
  })
});