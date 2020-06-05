const { mapArrayToObj } = require('common/helpers/utils');

const pubSubMocks = pubSub => {
  const topics = [
    'leave',
    'startGame',
    'gameOver',
    'lowerPiece',
    'clearLines',
    'getPieces',
    'updatePlayer',
    'addPowerUp',
    'usePowerUp',
  ]

  const mocks = mapArrayToObj(topics, () => jest.fn());
  const unsubscribe = topics.map(topic => pubSub.subscribe(topic, mocks[topic]));
  const unsubscribeAll = () => unsubscribe.forEach(unsub => unsub());

  return {
    ...mocks,
    unsubscribeAll,
  }
}

module.exports = {
  pubSubMocks,
}