const ClientError = require('frontend/static/js/ClientError');
const { publish } = require('frontend/helpers/pubSub');
const { getMockDOMSelector } = require('frontend/mockData/mocks');
const { ERROR_TIMEOUT } = require('frontend/helpers/clientConstants');
const { ADD_ERROR, CLEAR_ERROR } = require('frontend/helpers/clientTopics');

describe('client error message tests', () => {
  let clientError;
  const errorText = 'some error';

  beforeEach(() => {
    const errorSelector = getMockDOMSelector();
    errorSelector.classList.add('hide');
    clientError = new ClientError(errorSelector);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clientError.unsubscribe();
  });

  test('add error message', () => {
    expect(clientError.error.classList.contains('hide')).toBe(true);

    publish(ADD_ERROR, errorText);

    expect(clientError.error.innerText).toBe(errorText);
    expect(clientError.error.classList.contains('hide')).toBe(false);
  });

  test('clear error message', () => {
    expect(clientError.error.classList.contains('hide')).toBe(true);

    publish(ADD_ERROR, errorText);

    expect(clientError.error.innerText).toBe(errorText);
    expect(clientError.error.classList.contains('hide')).toBe(false);

    publish(CLEAR_ERROR);

    expect(clientError.error.classList.contains('hide')).toBe(true);
  });

  test('handle error', () => {
    expect(clientError.error.classList.contains('hide')).toBe(true);

    publish(ADD_ERROR, errorText);

    expect(clientError.error.innerText).toBe(errorText);
    expect(clientError.error.classList.contains('hide')).toBe(false);

    jest.advanceTimersByTime(ERROR_TIMEOUT);
;
    expect(clientError.error.classList.contains('hide')).toBe(true);
  });
});