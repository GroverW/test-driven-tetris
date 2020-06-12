const ClientError = require('frontend/static/js/clientError');
const { publish } = require('frontend/helpers/pubSub');
const { getMockDOMSelector } = require('frontend/mockData/mocks');

describe('client error message tests', () => {
  let clientError;
  let errorText = 'some error';
  let blankError = '';

  beforeEach(() => {
    let errorSelector = getMockDOMSelector();
    errorSelector.classList.add('hide');
    clientError = new ClientError(errorSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    clientError.unsubscribe();
  });

  test('add error message', () => {
    expect(clientError.error.classList.contains('hide')).toBe(true);

    publish('addError', errorText);

    expect(clientError.error.innerText).toBe(errorText);
    expect(clientError.error.classList.contains('hide')).toBe(false);
  });

  test('clear error message', () => {
    expect(clientError.error.classList.contains('hide')).toBe(true);

    publish('addError', errorText);

    expect(clientError.error.innerText).toBe(errorText);
    expect(clientError.error.classList.contains('hide')).toBe(false);

    publish('clearError');

    expect(clientError.error.innerText).toBe(blankError);
    expect(clientError.error.classList.contains('hide')).toBe(true);
  });
});