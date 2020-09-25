const PowerUpDisplay = require('frontend/static/js/GameDOM/PowerUpDisplay');
const { publish } = require('frontend/helpers/pubSub');
const { MAX_POWER_UPS, POWER_UP_TYPES } = require('frontend/constants');
const { ADD_POWER_UP, USE_POWER_UP } = require('frontend/topics');
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

  describe('add / use / clear power ups', () => {
    const numPowerUps = (powerUps) => powerUps.filter((p) => p.type !== null).length;
    const nodeClassListContains = (nodeId, powerUpId) => (
      powerUpDisplay.powerUps[nodeId].node.classList.contains(`power-up${powerUpId}`)
    );

    test('adds power up if valid type', () => {
      expect(powerUpDisplay.nextIdx).toBe(0);
      publish(ADD_POWER_UP, POWER_UP_TYPES.SWAP_LINES);

      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(1);
      expect(powerUpDisplay.nextIdx).toBe(1);

      publish(ADD_POWER_UP, -5);

      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(1);
      expect(powerUpDisplay.nextIdx).toBe(1);

      publish(ADD_POWER_UP, POWER_UP_TYPES.SCRAMBLE_BOARD);

      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(2);
      expect(powerUpDisplay.nextIdx).toBe(2);
    });

    test('does not add more than MAX_POWER_UPS', () => {
      ['SWAP_LINES', 'SCRAMBLE_BOARD', 'SWAP_LINES', 'SCRAMBLE_BOARD'].forEach((type) => {
        publish(ADD_POWER_UP, POWER_UP_TYPES[type]);
      });

      expect(powerUpDisplay.nextIdx).toBe(2);
      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(2);
    });

    test('uses first power up and sets first to second', () => {
      const node1 = 0;
      const node2 = 1;
      const id1 = POWER_UP_TYPES.SWAP_LINES;
      const id2 = POWER_UP_TYPES.SCRAMBLE_BOARD;

      publish(ADD_POWER_UP, id1);
      publish(ADD_POWER_UP, id2);

      expect(nodeClassListContains(node1, id1)).toBe(true);
      expect(nodeClassListContains(node2, id2)).toBe(true);
      expect(powerUpDisplay.nextIdx).toBe(2);
      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(2);

      publish(USE_POWER_UP);

      expect(nodeClassListContains(node1, id2)).toBe(true);
      expect(nodeClassListContains(node1, id1)).toBe(false);
      expect(nodeClassListContains(node2, id2)).toBe(false);
      expect(powerUpDisplay.nextIdx).toBe(1);
      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(1);

      publish(USE_POWER_UP);

      expect(nodeClassListContains(node1, id2)).toBe(false);
      expect(powerUpDisplay.nextIdx).toBe(0);
      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(0);
    });

    test('clears power ups', () => {
      const id1 = POWER_UP_TYPES.SWAP_LINES;
      const id2 = POWER_UP_TYPES.SCRAMBLE_BOARD;

      publish(ADD_POWER_UP, id1);
      publish(ADD_POWER_UP, id2);

      powerUpDisplay.clearPowerUps();

      powerUpDisplay.powerUps.forEach((_, nodeIdx) => {
        expect(nodeClassListContains(nodeIdx, id1)).toBe(false);
        expect(nodeClassListContains(nodeIdx, id2)).toBe(false);
      });
      expect(numPowerUps(powerUpDisplay.powerUps)).toBe(0);
      expect(powerUpDisplay.nextIdx).toBe(0);
    });
  });
});
