const initSocket = (gameId) => new Promise((resolve, reject) => {
  const ws = new WebSocket(`ws://localhost:3000/game/${gameId}`);

  ws.onmessage = () => resolve(ws);

  ws.onclose = () => reject(new Error('failed to connect'));
});

const destroySocket = (ws) => new Promise((resolve) => {
  if (!ws) resolve(false);

  if (ws.readyState === 1) {
    ws.close();
    resolve(true);
  }

  resolve(false);
});

module.exports = {
  initSocket,
  destroySocket,
};
