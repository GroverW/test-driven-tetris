const { mapPowerUps } = require('frontend/static/js/GameDOM/DOMHelpers');

class PowerUpDisplay {
  constructor(selectors) {
    this.powerUps = mapPowerUps(selectors);
  }
}

module.exports = PowerUpDisplay;
