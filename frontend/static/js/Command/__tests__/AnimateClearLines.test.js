const AnimateClearLines = require('frontend/static/js/Command/Animation/AnimateClearLines');
const { getTestBoard, pubSubMock } = require('frontend/mocks');
const { COLOR_STEPS } = require('frontend/constants');
const { DRAW } = require('frontend/topics');

describe('Animate Clear Lines tests', () => {
  let animate;
  let pubSubSpy;
  let drawSpy;
  let testBoard;

  beforeEach(() => {
    pubSubSpy = pubSubMock();
    drawSpy = pubSubSpy.add(DRAW);
    testBoard = getTestBoard('pattern1');
    animate = new AnimateClearLines(testBoard);
  });

  afterEach(() => {
    pubSubSpy.unsubscribe();
  });

  test('animation properties', () => {
    const {
      grid, type, delayList, brightnessMap,
    } = animate;
    expect([grid, type, delayList]).toEqual([expect.any(Array), 'animation', [0, 0, 0, 0]]);
    expect(brightnessMap.length).toBe(delayList.length);
  });

  test('publishes DRAW with grid and brightness', () => {
    animate.execute(1);
    expect(drawSpy).toHaveBeenCalledTimes(1);
    expect(drawSpy).toHaveBeenLastCalledWith({
      grid: testBoard, brightness: animate.brightnessMap[0],
    });
  });

  test('updates brightness along with delay and does not exceed max', () => {
    animate.delayList.forEach(() => {
      expect(animate.brightness).toBe(animate.brightnessMap[animate.delayIdx]);
      expect(animate.brightness).toBeLessThan(COLOR_STEPS + 1);
    });
  });

  test('sets delay to infinity once end of animation reached', () => {
    animate.delayList.forEach(() => {
      expect(animate.delay).toBe(0);
      animate.execute(0);
    });
    expect(animate.delay).toBe(Infinity);
  });
});
