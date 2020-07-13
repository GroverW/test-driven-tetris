const commonUtils = require('common/helpers/utils');
const { ADD_MESSAGE } = require('./serverTopics');

const sendMessage = (player, type, message) => {
  player.send(commonUtils.formatMessage({
    type: ADD_MESSAGE,
    data: { type, message },
  }));
};

module.exports = {
  ...commonUtils,
  sendMessage,
};
