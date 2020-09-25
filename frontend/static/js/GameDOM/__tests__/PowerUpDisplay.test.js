const PowerUpDisplay = require('frontend/static/js/GameDOM/PowerUpDisplay');
const { MAX_POWER_UPS } = require('frontend/constants');
const { getMockGameDOMSelectors } = require('frontend/mocks');

describe('power up display tests', () => {
  let powerUpDisplay;

  beforeEach(() => {
    const { powerUps } = getMockGameDOMSelectors();
    powerUpDisplay = new PowerUpDisplay(powerUps);
  });

  describe('setup', () => {
    test('power up display properties', () => {
      expect(powerUpDisplay.powerUps.length).toBe(MAX_POWER_UPS);
      powerUpDisplay.powerUps.forEach((powerUpNode) => {
        expect(powerUpNode.type).toBe(null);
      });
    });
  });

  describe('add / use power up', () => {
    test('adds power up if valid type', () => {

    });

    test('does not add power up if invalid type', () => {

    });

    test('uses first power up and sets first to second', () => {

    });

    test('clears power ups if only one', () => {

    });
  });
});
