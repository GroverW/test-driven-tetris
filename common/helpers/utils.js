const { BOARD_WIDTH, BOARD_HEIGHT } = require('common/constants');

/**
 * Randomizes elements in an array
 * @param {array} arr
 * @returns {array} - new copy of array with elements randomized
 */
const randomize = (arr) => {
  let start = arr.length - 1;
  const randomized = [...arr];

  while (start > 0) {
    const swapWith = Math.floor(Math.random() * (start + 1));
    [randomized[swapWith], randomized[start]] = [randomized[start], randomized[swapWith]];
    start -= 1;
  }

  return randomized;
};

/**
 * Returns a new, empty board
 */
const getEmptyBoard = () => (
  new Array(BOARD_HEIGHT).fill(null).map(() => new Array(BOARD_WIDTH).fill(0))
);

/**
 * Maps keys in an array to values in an object. O(n) vs O(n^2) for Array.reduce
 * @param {array} keysArr - list of keys to add to object
 * @param {function} callback - callback to create object values
 * @param {object} resObj - object to add elements to
 * @returns {object} - object with keys mapped to values
 */
const mapArrayToObj = (keysArr, callback, resObj = {}) => {
  const newObj = { ...resObj };
  keysArr.forEach((key, idx, arr) => {
    const result = callback(key, idx, arr);
    if (result) newObj[key] = result;
  });

  return newObj;
};

/**
 * Formats message to be sent over web socket
 * @param {string} type - type of message to send
 * @param {*} data - data to send
 * @returns {string} - JSON stringified message
 */
const formatMessage = ({ type, data }) => JSON.stringify({ type, data });

module.exports = {
  randomize,
  getEmptyBoard,
  mapArrayToObj,
  formatMessage,
};
