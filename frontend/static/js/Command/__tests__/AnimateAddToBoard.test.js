const AnimateAddToBoard = require('frontend/static/js/Command/Animation/AnimateAddToBoard');
const { getTestPiece, pubSubMock } = require('frontend/mocks');
const Piece = require('common/js/Piece');
const { COLOR_STEPS } = require('frontend/constants');
const { DRAW } = require('frontend/topics');

describe('Animate Add to Board tests', () => {
  let animate;
  let pubSubSpy;
  let drawSpy;
  let testPiece;

  beforeEach(() => {
    pubSubSpy = pubSubMock();
    drawSpy = pubSubSpy.add(DRAW);
    testPiece = getTestPiece('I');
    animate = new AnimateAddToBoard(testPiece);
  });

  afterEach(() => {
    pubSubSpy.unsubscribe();
  });

  test('animation properties', () => {
    const {
      piece, type, delayList, brightnessMap,
    } = animate;
    expect([piece, type, delayList]).toEqual([expect.any(Piece), 'animation', [0, 0, 0, 0, 0]]);
    expect(brightnessMap.length).toBe(delayList.length);
  });

  test('publishes DRAW with piece and brightness', () => {
    animate.execute(1);
    expect(drawSpy).toHaveBeenCalledTimes(1);
    expect(drawSpy).toHaveBeenLastCalledWith({
      piece: testPiece, brightness: animate.brightnessMap[0],
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
