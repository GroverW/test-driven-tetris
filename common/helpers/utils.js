const { BOARD_WIDTH, BOARD_HEIGHT } = require('./constants');

/**
 * Randomizes elements in an array
 * @param {array} arr 
 * @returns {array} - new copy of array with elements randomized
 */
const randomize = arr => {
  let start = arr.length - 1;
  let randomized = [...arr];

  while (start > 0) {
    const swapWith = Math.floor(Math.random() * (start + 1));
    [randomized[swapWith], randomized[start]] = [randomized[start], randomized[swapWith]];
    start--;
  }

  return randomized;
}

/**
 * Returns a new, empty board
 */
const getEmptyBoard = () => new Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

/**
 * Maps keys in an array to values in an object. O(n) vs O(n^2) for Array.reduce
 * @param {array} keysArr - list of keys to add to object
 * @param {function} callback - callback to create object values
 * @param {object} resObj - object to add elements to
 * @returns {object} - object with keys mapped to values
 */
const mapArrayToObj = (keysArr, callback, resObj = {}) => {
  keysArr.forEach((key, idx, keysArr) => {
    const result = callback(key, idx, keysArr);
    if (result) resObj[key] = result;
  });

  return resObj;
}

module.exports = {
  randomize,
  getEmptyBoard,
  mapArrayToObj,
}