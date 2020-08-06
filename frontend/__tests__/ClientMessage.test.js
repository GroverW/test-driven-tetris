const clientMessage = require('frontend/static/js/ClientMessage');
const { publish } = require('frontend/helpers/pubSub');
const { getMockDOMSelector } = require('frontend/mocks');
const { MESSAGE_TIMEOUT } = require('frontend/constants');
const { ADD_MESSAGE, CLEAR_MESSAGE, MSG_TYPE } = require('frontend/topics');

describe('client message tests', () => {
  const messageText = 'some message';
  const errorData = {
    type: MSG_TYPE.ERROR,
    message: messageText,
  };
  const noticeData = {
    type: MSG_TYPE.NOTICE,
    message: messageText,
  };

  beforeEach(() => {
    const messageSelector = getMockDOMSelector();
    messageSelector.classList.add('hide');
    clientMessage.initialize(messageSelector);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clientMessage.unsubscribe();
  });

  test('adds error message', () => {
    expect(clientMessage.message.classList.contains('hide')).toBe(true);

    publish(ADD_MESSAGE, errorData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains(MSG_TYPE.ERROR)).toBe(true);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);
  });

  test('adds notice message', () => {
    publish(ADD_MESSAGE, noticeData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains(MSG_TYPE.NOTICE)).toBe(true);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);
  });

  test('clears error message', () => {
    publish(CLEAR_MESSAGE);

    expect(clientMessage.message.classList.contains('hide')).toBe(true);
  });

  test('handles error', () => {
    publish(ADD_MESSAGE, errorData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);

    jest.advanceTimersByTime(MESSAGE_TIMEOUT);

    expect(clientMessage.message.classList.contains('hide')).toBe(true);
  });
});
