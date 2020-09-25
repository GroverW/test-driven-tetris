const SubscriberBase = require('common/js/SubscriberBase');
const pubSub = require('frontend/helpers/pubSub');
const {
  mapPowerUps, getPowerUpType, getNullPowerUp,
} = require('frontend/static/js/GameDOM/DOMHelpers');
const { ADD_POWER_UP, USE_POWER_UP } = require('frontend/topics');

class PowerUpDisplay extends SubscriberBase {
  constructor(selectors) {
    super(pubSub, null);
    this.powerUps = mapPowerUps(selectors);
    this.nextIdx = 0;
    this.mapSubscriptions([ADD_POWER_UP, USE_POWER_UP]);
  }

  [ADD_POWER_UP](powerUp) {
    const nextPowerUpDisplay = this.getNextPowerUpDisplay();
    const [powerUpType, powerUpClass] = getPowerUpType(powerUp);
    nextPowerUpDisplay.type = powerUpType;
    nextPowerUpDisplay.node.classList.add(powerUpClass);
    this.incrementNextIdx(nextPowerUpDisplay);
  }

  getCurrentPowerUp() {
    return this.powerUps[this.nextIdx] || getNullPowerUp();
  }

  getNextPowerUpDisplay() {
    const nextPowerUpDisplay = this.getCurrentPowerUp();
    return nextPowerUpDisplay;
  }

  incrementNextIdx(currentPowerUpDisplay) {
    const increment = currentPowerUpDisplay.type !== null;
    this.nextIdx = Math.min(
      this.powerUps.length,
      this.nextIdx + increment,
    );
  }

  [USE_POWER_UP]() {
    this.powerUps.forEach((powerUp, idx, list) => {
      const currentPowerUp = powerUp;
      const nextPowerUp = list[idx + 1] || getNullPowerUp();
      const [nextType, nextClass] = getPowerUpType(nextPowerUp.type);
      const [, currentClass] = getPowerUpType(powerUp.type);
      currentPowerUp.type = nextType;
      currentPowerUp.node.classList.remove(currentClass);
      currentPowerUp.node.classList.add(nextClass);
    });
    this.decrementNextIdx();
  }

  decrementNextIdx() {
    const currentPowerUpDisplay = this.getCurrentPowerUp();
    const decrement = currentPowerUpDisplay.type === null;
    this.nextIdx = Math.max(0, this.nextIdx - decrement);
  }

  clearPowerUps() {
    const nullPowerUp = getNullPowerUp();
    this.powerUps.forEach((powerUp) => {
      const currentPowerUp = powerUp;
      const [, currentClass] = getPowerUpType(powerUp.type);
      currentPowerUp.node.classList.remove(currentClass);
      currentPowerUp.type = nullPowerUp.type;
    });
    this.nextIdx = 0;
  }
}

module.exports = PowerUpDisplay;
