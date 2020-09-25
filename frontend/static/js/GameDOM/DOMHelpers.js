const { MAX_POWER_UPS, POWER_UPS } = require('frontend/constants');

/**
 * Creates and returns a new HTML Element
 * @param {string} type - element tag
 * @param {object} [container] - a container this element should be appended to
 * @param {string} [id] - id to give element
 * @param {string} [class] - class to give element
 * @param {string} [text] - element text to display
 */
const createElement = (type, {
  container, id, classList, text,
}) => {
  const newElement = document.createElement(type);

  if (id) newElement.id = id;
  if (classList) newElement.classList.add(...classList.split(' '));
  if (text) newElement.innerText = text;
  if (container) container.appendChild(newElement);

  return newElement;
};

const addPowerUpTargetId = (container, id) => createElement('div', {
  container,
  classList: 'power-up-target',
  text: id,
});

/**
 * Adds game over message for a specified player
 * @param {object} container - DOM selector for player container
 * @param {object} message - message to include
 * @param {string} message.header - message header
 * @param {string[]} message.body - list of messages in body
 */
const addMessage = (selector, message) => {
  const container = selector;
  container.innerText = '';
  container.classList.remove('hide');

  const messageElementText = createElement('div', { container, classList: 'game-message-text' });
  createElement('h1', { container: messageElementText, text: message.header });

  message.body.forEach((line) => (
    createElement('p', { container: messageElementText, text: line })
  ));
};

/**
 * Adds 'hide' class to provided element
 * @param {object} selector - DOM selector
 */
const hideElement = (selector) => {
  selector.classList.add('hide');
};

/**
 * Creates a new html canvas for an additional player
 * @param {number} id - player id
 * @returns {object[]} - canvad DOM node and ctx
 */
const getNewPlayerCanvas = (id) => {
  const canvas = createElement('canvas', { id: `p${id}-board`, classList: 'game-board' });
  const ctx = canvas.getContext('2d');

  return [canvas, ctx];
};

/**
 * Maps a list of DOM selectors to an array of objects
 * @param {object[]} selectors - list of DOM selectors
 * @returns {object[]|boolean} - list of objects containing DOM selector and type or false if empty
 */
const mapPowerUps = (selectors) => (
  selectors ? selectors.map((node) => ({ node, type: null })).slice(0, MAX_POWER_UPS) : false
);

const getPowerUpType = (powerUpId) => {
  const powerUpType = POWER_UPS.has(powerUpId) ? powerUpId : null;
  const powerUpClass = `power-up${powerUpType || ''}`;
  return [powerUpType, powerUpClass];
};

const getNullPowerUp = () => ({
  type: null,
  node: {
    classList: {
      add: () => {},
      replace: () => {},
      remove: () => {},
    },
  },
});

module.exports = {
  createElement,
  addPowerUpTargetId,
  addMessage,
  hideElement,
  getNewPlayerCanvas,
  mapPowerUps,
  getPowerUpType,
  getNullPowerUp,
};
