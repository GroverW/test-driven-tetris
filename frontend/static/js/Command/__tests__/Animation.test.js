const Animation = require('frontend/static/js/Command/Animation');
const AnimateAddToBoard = require('frontend/static/js/Command/Animation/AnimateAddToBoard');
const AnimateClearLines = require('frontend/static/js/Command/Animation/AnimateClearLines');
const Command = require('frontend/static/js/Command');
const NullCommand = require('frontend/static/js/Command/NullCommand');
const Board = require('common/js/Board');
const { pubSubMock } = require('frontend/mocks');
const { CLEAR_COMMAND } = require('frontend/topics');

describe('Animation tests', () => {
  let animation;
  let addToBoard;
  let clearLines;
  let board;
  let newStep;
  let pubSubSpy;

  beforeEach(() => {
    addToBoard = new AnimateAddToBoard();
    clearLines = new AnimateClearLines();
    board = new Board();
    newStep = new Command(null, board.isEmpty.bind(board, 0, 0));
    animation = new Animation(addToBoard, clearLines);
    pubSubSpy = pubSubMock();
  });

  test('animation properties', () => {
    expect(animation.steps.length).toBe(2);
    expect(animation.type).toBe('animation');
    expect(animation.key).toBe('animation');
    expect([...animation.steps]).toEqual([addToBoard, clearLines]);
  });

  test('adds a new step', () => {
    animation.addStep(newStep);
    expect(animation.steps.length).toBe(3);
  });

  test('only executes the first step until that animation has ended', () => {
    const addToBoardSpy = jest.spyOn(addToBoard, 'execute');
    const clearLinesSpy = jest.spyOn(clearLines, 'execute');

    addToBoard.delayList.forEach(() => animation.execute(0));

    expect(addToBoardSpy).toHaveBeenCalledTimes(addToBoard.delayList.length);
    expect(clearLinesSpy).toHaveBeenCalledTimes(0);

    animation.execute(0);

    expect(addToBoardSpy).toHaveBeenCalledTimes(addToBoard.delayList.length);
    expect(clearLinesSpy).toHaveBeenCalledTimes(1);
  });

  test('stops executing and calls CLEAR_COMMAND once all steps have been executed', () => {
    const clearAnimationSpy = pubSubSpy.add(CLEAR_COMMAND);
    const addToBoardSpy = jest.spyOn(addToBoard, 'execute');
    const clearLinesSpy = jest.spyOn(clearLines, 'execute');

    animation.steps.forEach((step) => (
      step.delayList.forEach(() => animation.execute(0))
    ));

    expect(addToBoardSpy).toHaveBeenCalledTimes(addToBoard.delayList.length);
    expect(clearLinesSpy).toHaveBeenCalledTimes(clearLines.delayList.length);
    expect(clearAnimationSpy).toHaveBeenCalledTimes(1);
    expect(animation.steps[animation.currStep]).toEqual(expect.any(NullCommand));
  });
});
