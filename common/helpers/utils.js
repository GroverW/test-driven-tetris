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
 *
 * @param {array} arr
 * @param {number} numBuckets - number of times to repeat randomizing
 * @returns {array} - new copy of array with elements randomized
 */
const randomizedBuckets = (arr, numBuckets) => {
  let currBucket = 0;
  const result = [];

  while (currBucket < numBuckets) {
    const randomized = randomize(arr);
    result.push(...randomized);
    currBucket += 1;
  }

  return result;
};

/**
 * Returns a blank board row
 * @returns {number[]}
 */
const getEmptyRow = () => new Array(BOARD_WIDTH).fill(0);

/**
 * Returns a new, empty board
 */
const getEmptyBoard = () => (
  new Array(BOARD_HEIGHT).fill(null).map(() => getEmptyRow())
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
  randomizedBuckets,
  getEmptyBoard,
  getEmptyRow,
  mapArrayToObj,
  formatMessage,
};
