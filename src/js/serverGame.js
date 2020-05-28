const Game = require('common/js/game');
const ServerBoard = require('./serverBoard');

class ServerGame extends Game {
  constructor(pubSub, playerId) {
    super(playerId, pubSub, ServerBoard);
    this.pubSub = pubSub;
  }

  command(action) {
    const commands = {
      LEFT: () => this.board.movePiece(-1,0),
      RIGHT: () => this.board.movePiece(1,0),
      DOWN: () =>  this.board.movePiece(0,1),
      AUTO_DOWN: () => this.board.movePiece(0,1,0),
      ROTATE_LEFT: () => this.board.rotatePiece(-1),
      ROTATE_RIGHT: () => this.board.rotatePiece(1),
      HARD_DROP: () => this.board.hardDrop(),
    }

    if((action in commands) && this.gameStatus) commands[action]();
  }

  executeCommandQueue(commands) {
    commands.forEach(action => this.command(action));
    
    this.pubSub.publish('updatePlayer', {
      id: this.playerId,
      board: this.board.grid,
    });
  }

  gameOver() {
    this.unsubscribe();
    this.gameStatus = null;
  }

  unsubscribe() {
    this.subscriptions.forEach(unsub => unsub());
  }
}

module.exports = ServerGame;