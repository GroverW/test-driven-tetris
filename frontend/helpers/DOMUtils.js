const addText = (selector, text) => {
  selector.innerText = text;
}

/**
 * Creates and returns a new HTML Element
 * @param {string} type - element tag
 * @param {object} [container] - a container this element should be appended to
 * @param {string} [id] - id to give element 
 * @param {string} [class] - class to give element 
 * @param {string} [text] - element text to display
 */
const createElement = (type, { container, id, classList, text }) => {
  let newElement = document.createElement(type);
  
  if (id) newElement.id = id;
  if (classList) newElement.classList.add(...classList.split(' '));
  if (text) addText(newElement, text);
  if (container) container.appendChild(newElement);

  return newElement;
}

const addPowerUpTargetId = (container, id) => 
  createElement('div', {
    container,
    classList: 'power-up-target',
    text: id,
  });

module.exports = {
  addText,
  createElement,
  addPowerUpTargetId,
}