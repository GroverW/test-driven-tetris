const AnimateAddToBoard = require('frontend/static/js/Command/AnimateAddToBoard');
const { getTestPiece, pubSubMock } = require('frontend/mocks');
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
    expect(animate.type).toBe('animation');
    expect(animate.delayList).toEqual([0, 0, 0, 0]);
  });

  test('publishes DRAW with piece and brightness', () => {
    animate.execute(1);
    expect(drawSpy).toHaveBeenCalledTimes(1);
    expect(drawSpy).toHaveBeenLastCalledWith({
      piece: testPiece, brightness: expect.any(Number),
    });
  });
});
