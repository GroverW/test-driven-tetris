// const request = require('supertest');
const io = require('socket.io-client');
const ioBackend = require('socket.io');
const server = require('../server');
const ioOptions = {
  'reconnection delay': 0,
  'reopen delay': 0,
  'force new connection': true,
  transports: ['websocket']
}

let socket;
let client;
let ioServer;

const BASE_URL = "ws://localhost:3000/test";

// /**
//  * setup websocket and http servers
//  */
// beforeAll(done => {
//   httpServer = http.createServer().listen();
//   httpServerAddress = httpServer.listen().address();
//   ioServer = ioBackend(httpServer);
//   done();
// });

/**
 * cleanup websocket and http servers
 */
// afterAll(done => {
//   io.disconnect();
//   done();
// });

/**
 * setup each test
 */

describe("route tests", () => {
  beforeEach( async (done) => {
    // client = io.connect(BASE_URL, ioOptions);
    // console.log("HMMMM",client.connected);
    // client.on('connect', () => {
    //   console.log('connected');
    //   done()
    // });
    const ws = new WebSocket(BASE_URL);
    console.log(ws);
    ws.onopen = evt => {
      console.log('open', evt)
    }
    done()
  });

  /**
   * cleanup each test
   */
  // afterEach(async done => {
  //   client.connected && client.disconnect();
  //   done();
  // })

  describe('Message Test', () => {
    test('sends a message', async (done) => {
      console.log("heyoooo");
      // client.emit('message', 'hello');
      // client.on('message', msg => {
      //   expect(msg).toBe('hello');
      // })

      // client.disconnect();
      done();
    });
  });
});