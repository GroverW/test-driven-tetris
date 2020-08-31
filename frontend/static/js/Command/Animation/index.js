const NullCommand = require('frontend/static/js/Command/NullCommand');
const { publish } = require('frontend/helpers/pubSub');
const { CLEAR_COMMAND } = require('frontend/topics');

class Animation {
  constructor(...steps) {
    this.type = 'animation';
    this.key = 'animation';
    this.steps = steps;
    this.currStep = 0;
  }

  addStep(newStep) {
    this.steps.push(newStep);
  }

  execute(currTime) {
    this.steps[this.currStep].execute(currTime);
    this.updateCurrStep();
  }

  updateCurrStep() {
    if (this.steps[this.currStep].delay === Infinity) {
      this.currStep += 1;
    }

    if (this.currStep === this.steps.length) {
      this.clearAnimation();
    }
  }

  clearAnimation() {
    this.addStep(new NullCommand());
    publish(CLEAR_COMMAND, this.key);
  }
}

module.exports = Animation;
