let ws;

const TEST_PORT = 1234;

const initSocket = (gameId) => new Promise((resolve, reject) => {
  ws = new WebSocket(`ws://localhost:${TEST_PORT}/game/${gameId}`);

  ws.onmessage = () => resolve(ws);

  ws.onclose = () => reject(new Error('failed to connect'));
});

const destroySocket = () => new Promise((resolve) => {
  if (ws.readyState === 1) {
    ws.close();
    resolve(true);
  }

  resolve(false);
});

module.exports = {
  initSocket,
  destroySocket,
  TEST_PORT,
};
