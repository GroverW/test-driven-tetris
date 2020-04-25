const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const ROTATE_LEFT = -1;
const ROTATE_RIGHT = 1;
const PIECES = [
  [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  [
    [2,2],
    [2,2]
  ],
  [
    [0,3,0],
    [3,3,3],
    [0,0,0]
  ],
  [
    [0,4,4],
    [4,4,0],
    [0,0,0]
  ],
  [
    [5,5,0],
    [0,5,5],
    [0,0,0]
  ],
  [
    [6,6,6],
    [6,0,0],
    [0,0,0]
  ],
  [
    [7,7,7],
    [0,0,7],
    [0,0,0]
  ]
]
const SEED_PIECES = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6]

module.exports = {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  ROTATE_LEFT,
  ROTATE_RIGHT,
  PIECES,
  SEED_PIECES
}