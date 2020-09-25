const SubscriberBase = require('common/js/SubscriberBase');
const pubSub = require('frontend/helpers/pubSub');
const {
  mapPowerUps, getPowerUpType, getNullPowerUp,
} = require('frontend/static/js/GameDOM/DOMHelpers');
const { ADD_POWER_UP } = require('frontend/topics');

class PowerUpDisplay extends SubscriberBase {
  constructor(selectors) {
    super(pubSub, null);
    this.powerUps = mapPowerUps(selectors);
    this.nextIdx = 0;
    this.mapSubscriptions([ADD_POWER_UP]);
  }

  [ADD_POWER_UP](powerUp) {
    const nextPowerUpDisplay = this.getNextPowerUpDisplay();
    const [powerUpType, powerUpClass] = getPowerUpType(powerUp);
    nextPowerUpDisplay.type = powerUpType;
    nextPowerUpDisplay.node.classList.add(powerUpClass);
    this.incrementNextIdx(nextPowerUpDisplay);
  }

  getNextPowerUpDisplay() {
    const nextPowerUpDisplay = this.powerUps[this.nextIdx] || getNullPowerUp();
    return nextPowerUpDisplay;
  }

  incrementNextIdx(currentPowerUpDisplay) {
    const increment = currentPowerUpDisplay.type !== null;
    this.nextIdx = Math.min(
      this.powerUps.length,
      this.nextIdx + increment,
    );
  }
}

module.exports = PowerUpDisplay;
