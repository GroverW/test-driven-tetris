const { mapArrayToObj } = require('common/helpers/utils');
const { PLAYER_KEYS } = require('frontend/helpers/clientConstants');

const HardDrop = require('./HardDrop');
const MoveDown = require('./MoveDown');
const MoveLeft = require('./MoveLeft');
const MoveRight = require('./MoveRight');
const RotateLeft = require('./RotateLeft');
const RotateRight = require('./RotateRight');
const PowerUp = require('./PowerUp');

const getCommandList = (game) => ({
  [HardDrop.getKey()]: () => new HardDrop(game),
  [MoveDown.getKey()]: () => new MoveDown(game),
  [MoveLeft.getKey()]: () => new MoveLeft(game),
  [MoveRight.getKey()]: () => new MoveRight(game),
  [RotateLeft.getKey()]: () => new RotateLeft(game),
  [RotateRight.getKey()]: () => new RotateRight(game),
  ...mapArrayToObj(PLAYER_KEYS, (PKEY) => () => new PowerUp(PKEY, game)),
});

module.exports = {
  getCommandList,
};
