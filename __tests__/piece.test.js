const Piece = require('../piece');
const { PIECES } = require('../config');

describe('game pieces', () => {

  beforeAll(() => {
    Math.random = jest.fn().mockReturnValue(1)
  })

  afterAll(() => {
    jest.clearAllMocks();
  })

  test('creates a new piece', () => {
    const testPiece = new Piece();
    expect(testPiece.piece).toEqual(PIECES[0]);
  })
})