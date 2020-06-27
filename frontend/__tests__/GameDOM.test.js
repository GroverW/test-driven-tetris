const GameDOM = require('frontend/static/js/GameDOM');
const ClientGame = require('frontend/static/js/ClientGame');
const { Piece } = require('common/js/Piece');
const { publish } = require('frontend/helpers/pubSub');
const { getNewPlayer } = require('frontend/helpers/clientUtils');
const {
  CONTROLS,
  PIECE_TYPES,
  POWER_UP_TYPES,
  LINES_PER_LEVEL,
} = require('frontend/helpers/clientConstants');
const {
  ADD_PLAYER,
  REMOVE_PLAYER,
  CLEAR_LINES,
  ADD_POWER_UP,
  USE_POWER_UP,
} = require('frontend/helpers/clientTopics');
const { 
  getMockDOMSelector,
  getMockGameDOMSelectors,
  getMockCtx,
  getTestBoard,
  getTestPieces,
} = require('frontend/mockData/mocks');

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

    gameDOM = new GameDOM(getMockGameDOMSelectors());
    game = new ClientGame(1);
    game.addPieces(getTestPieces());
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
    expect(gameDOM.opponents).not.toBe(undefined);
    expect(gameDOM.gameView).not.toBe(undefined);
    expect(gameDOM.score).not.toBe(undefined);
    expect(gameDOM.level).not.toBe(undefined);
    expect(gameDOM.lines).not.toBe(undefined);
    expect(gameDOM.player).not.toBe(undefined);
    expect(gameDOM.players.length).toBe(0);
  });

  test('add player', () => {
    publish(ADD_PLAYER, newPlayer1.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.gameView.players.length).toBe(1);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
    expect(gameDOM.players[0].powerUpId.classList.contains('power-up-target')).toBe(true);
    expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
  });

  test('add 3rd player resizes 2nd player', () => {
    publish(ADD_PLAYER, newPlayer1.id)

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);

    publish(ADD_PLAYER, newPlayer2.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(2);
    expect(gameDOM.players.length).toBe(2);
    expect(gameDOM.gameView.players.length).toBe(2);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
    expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);
  });

  test('remove player', () => {
    publish(ADD_PLAYER, newPlayer1.id)
    
    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.gameView.players.length).toBe(1);

    publish(REMOVE_PLAYER, newPlayer1.id)

    expect(gameDOM.players.length).toBe(0);
    expect(gameDOM.gameView.players.length).toBe(0);
  });

  test('remove player - update power up targets', () => {
    publish(ADD_PLAYER, newPlayer1.id);
    publish(ADD_PLAYER, newPlayer2.id);

    expect(gameDOM.players.length).toBe(2);
    expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
    expect(gameDOM.players[1].powerUpId.innerText).toBe(3);

    publish(REMOVE_PLAYER, newPlayer1.id);

    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.players[0].powerUpId.innerText).toBe(2);
  });

  test('remove 3rd player resizes 2nd player', () => {
    publish(ADD_PLAYER, newPlayer1.id)

    expect(addPlayerSpy).toHaveBeenCalledTimes(1);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);

    publish(ADD_PLAYER, newPlayer2.id);

    expect(addPlayerSpy).toHaveBeenCalledTimes(2);
    expect(gameDOM.players.length).toBe(2);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(false);
    expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(true);

    publish(REMOVE_PLAYER, newPlayer1.id);

    expect(gameDOM.players.length).toBe(1);
    expect(gameDOM.players[0].node.classList.contains('item-large')).toBe(true);
    expect(gameDOM.players[0].node.classList.contains('item-small')).toBe(false);
  });

  test('scoreboard - updates on game start', () => {
    expect(gameDOM.score.innerText).toBe("");
    expect(gameDOM.level.innerText).toBe("");
    expect(gameDOM.lines.innerText).toBe("");
    
    game.start();

    expect(gameDOM.score.innerText).toBe(0);
    expect(gameDOM.level.innerText).toBe(1);
    expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL);
  });

  test('scoreboard - updates points when piece moves down', () => {
    game.start();
    
    game.command(CONTROLS.DOWN);

    expect(gameDOM.score.innerText).toBe(1);
  });

  test('scoreboard - updates on line clear (tetris)', () => {
    game.start();
    
    game.board.grid = getTestBoard('clearLines2');
    game.board.piece = new Piece(PIECE_TYPES.T);
    game.board.nextPiece = new Piece(PIECE_TYPES.I);

    expect(gameDOM.score.innerText).toBe(0);
    expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL);

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.LEFT);
    game.command(CONTROLS.HARD_DROP);

    game.command(CONTROLS.ROTATE_LEFT);    
    game.command(CONTROLS.HARD_DROP);

    expect(gameDOM.score.innerText).toBe(860);
    expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 4);
  });

  test('scoreboard - updates on level increase', () => {
    game.start();

    expect(gameDOM.level.innerText).toBe(1);

    publish(CLEAR_LINES, 4);

    expect(gameDOM.lines.innerText).toBe(LINES_PER_LEVEL - 4);
    expect(gameDOM.level.innerText).toBe(1);

    publish(CLEAR_LINES, 4);
    publish(CLEAR_LINES, 4);

    expect(gameDOM.level.innerText).toBe(2);
  });

  test('power ups - add power up', () => {
    publish(ADD_POWER_UP, POWER_UP_TYPES.SWAP_LINES);
    
    expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(1);

    publish(ADD_POWER_UP, -5);

    expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(1);

    publish(ADD_POWER_UP, POWER_UP_TYPES.SWAP_LINES);
    
    expect(gameDOM.powerUps.filter(p => p.type !== null).length).toBe(2);
  });

  test('power ups - use power up', () => {
    publish(ADD_POWER_UP, POWER_UP_TYPES.SWAP_LINES);
    publish(ADD_POWER_UP, POWER_UP_TYPES.SCRAMBLE_BOARD);

    const id1 = POWER_UP_TYPES.SWAP_LINES;
    const id2 = POWER_UP_TYPES.SCRAMBLE_BOARD;
    expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id1}`)).toBe(true);
    expect(gameDOM.powerUps[1].node.classList.contains(`power-up${id2}`)).toBe(true);

    publish(USE_POWER_UP);

    expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id2}`)).toBe(true);
    expect(gameDOM.powerUps[1].node.classList.contains(`power-up${id2}`)).toBe(false);

    publish(USE_POWER_UP);

    expect(gameDOM.powerUps[0].node.classList.contains(`power-up${id2}`)).toBe(false);

    expect(gameDOM.powerUps[0].node.classList.classes.length).toBe(0);
    expect(gameDOM.powerUps[1].node.classList.classes.length).toBe(0);
  });
});