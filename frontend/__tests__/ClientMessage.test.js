const ClientMessage = require('frontend/static/js/ClientMessage');
const { publish } = require('frontend/helpers/pubSub');
const { getMockDOMSelector } = require('frontend/mockData/mocks');
const { MESSAGE_TIMEOUT } = require('frontend/helpers/clientConstants');
const { ADD_MESSAGE, CLEAR_MESSAGE, MSG_TYPE } = require('frontend/helpers/clientTopics');

describe('client message tests', () => {
  let clientMessage;
  const messageText = 'some message';
  const errorData = {
    type: MSG_TYPE.ERROR,
    message: messageText,
  };
  const noticeData = {
    type: MSG_TYPE.NOTICE,
    message: messageText,
  }

  beforeAll(() => {
    const messageSelector = getMockDOMSelector();
    messageSelector.classList.add('hide');
    clientMessage = new ClientMessage(messageSelector);
  });

  afterAll(() => {
    clientMessage.unsubscribe();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('add error message', () => {
    expect(clientMessage.message.classList.contains('hide')).toBe(true);

    publish(ADD_MESSAGE, errorData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains(MSG_TYPE.ERROR)).toBe(true);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);
  });

  test('add notice message', () => {
    publish(ADD_MESSAGE, noticeData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains(MSG_TYPE.NOTICE)).toBe(true);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);
  });

  test('clear error message', () => {
    publish(CLEAR_MESSAGE);

    expect(clientMessage.message.classList.contains('hide')).toBe(true);
  });

  test('handle error', () => {
    publish(ADD_MESSAGE, errorData);

    expect(clientMessage.message.innerText).toBe(messageText);
    expect(clientMessage.message.classList.contains('hide')).toBe(false);

    jest.advanceTimersByTime(MESSAGE_TIMEOUT);
    
    expect(clientMessage.message.classList.contains('hide')).toBe(true);
  });
});