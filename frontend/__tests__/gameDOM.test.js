const GameDOM = require('frontend/static/js/gameDOM');
const ClientGame = require('frontend/static/js/clientGame');
const { Piece } = require('common/js/piece');
const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/clientUtils');
const { CONTROLS, PIECE_TYPES, POWER_UP_TYPES } = require('frontend/helpers/clientConstants');
const { 
  getMockDOMSelector,
  getMockCtx,
  getTestBoard,
  getTestPieces
} = require('../mockData/mocks');

describe('game DOM tests', () => {
  let gameDOM;
  let game;
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
      linesSelector: getMockDOMSelector(),
      playerSelector: getMockDOMSelector(),
      powerUpSelectors: [getMockDOMSelector(), getMockDOMSelector()],
    }

    gameDOM = new GameDOM(selectors);
    game = new ClientGame(1);
    game.board.pieceList.addSet(getTestPieces());
    addPlayerSpy = jest.spyOn(gameDOM.gameView, 'addPlayer');

    document.getElementById = jest.fn().mockImplementation(getMockDOMSelector);
    document.createElement = jest.fn().mockImplementation(getMockDOMSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    gameDOM.unsubscribe();
    game.unsubscribe();
  });

  test('start new game', () => {
    expect(gameDOM.gameContainer).not.toBe(undefined);
    expect(gameDOM.gameView).not.toBe(undefined);
    expect(gameDOM.scoreSelector).not.toBe(undefined);
    expect(gameDOM.levelSelector).not.toBe(undefined);
    expect(gameDOM.linesSelector).not.toBe(undefined);
    expect(gameDOM.playerSelector).not.toBe(undefined);
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

  test('scoreboard - updates on game start', () => {
    expect(gameDOM.scoreSelector.innerText).toBe("");
    expect(gameDOM.levelSelector.innerText).toBe("");
    expect(gameDOM.linesSelector.innerText).toBe("");
    
    game.start();

    expect(gameDOM.scoreSelector.innerText).toBe(0);
    expect(gameDOM.levelSelector.innerText).toBe(1);
    expect(gameDOM.linesSelector.innerText).toBe(0);
  });

  test('scoreboard - updates points when piece moves down', () => {
    game.start();
    
    game.command(CONTROLS.DOWN);

    expect(gameDOM.scoreSelector.innerText).toBe(1);
  });

  test('scoreboard - updates on line clear (tetris)', () => {
    game.start();
    
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = new Piece(PIECE_TYPES.T);
    game.board.nextPiece = new Piece(PIECE_TYPES.I);

    expect(gameDOM.scoreSelector.innerText).toBe(0);
    expect(gameDOM.linesSelector.innerText).toBe(0);

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.HARD_DROP);

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.HARD_DROP);

    expect(gameDOM.scoreSelector.innerText).toBe(860);
    expect(gameDOM.linesSelector.innerText).toBe(4);
  });

  test('scoreboard - updates on level increase', () => {
    game.start();

    expect(gameDOM.levelSelector.innerText).toBe(1);

    publish('clearLines', 4);

    expect(gameDOM.linesSelector.innerText).toBe(4);
    expect(gameDOM.levelSelector.innerText).toBe(1);

    publish('clearLines', 4);
    publish('clearLines', 4);

    expect(gameDOM.levelSelector.innerText).toBe(2);
  });

  test('power ups - add power up', () => {
    publish('addPowerUp', POWER_UP_TYPES.SWAP_LINES);
    
    expect(gameDOM.powerUps.length).toBe(1);

    publish('addPowerUp', -5);

    expect(gameDOM.powerUps.length).toBe(1);

    publish('addPowerUp', POWER_UP_TYPES.SWAP_LINES);
    
    expect(gameDOM.powerUps.length).toBe(2);

    publish('addPowerUp', POWER_UP_TYPES.SWAP_LINES);

    expect(gameDOM.powerUps.length).toBe(2);
  });

  test('power ups - use power up', () => {
    publish('addPowerUp', POWER_UP_TYPES.SWAP_LINES);
    publish('addPowerUp', POWER_UP_TYPES.SCRAMBLE_BOARD);

    const id1 = POWER_UP_TYPES.SWAP_LINES;
    const id2 = POWER_UP_TYPES.SCRAMBLE_BOARD;
    expect(gameDOM.powerUpSelectors[0].classList.contains(`powerUp${id1}`)).toBe(true);
    expect(gameDOM.powerUpSelectors[1].classList.contains(`powerUp${id2}`)).toBe(true);

    publish('usePowerUp');

    expect(gameDOM.powerUpSelectors[0].classList.contains(`powerUp${id2}`)).toBe(true);
    expect(gameDOM.powerUpSelectors[1].classList.contains(`powerUp${id2}`)).toBe(false);

    publish('usePowerUp');

    expect(gameDOM.powerUpSelectors[0].classList.contains(`powerUp${id2}`)).toBe(false);

    expect(gameDOM.powerUpSelectors[0].classList.classes.length).toBe(0);
    expect(gameDOM.powerUpSelectors[1].classList.classes.length).toBe(0);
  });
});