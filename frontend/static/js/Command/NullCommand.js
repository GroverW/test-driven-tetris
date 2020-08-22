const Command = require('.');

class NullCommand extends Command {
  constructor() {
    super(null, () => { }, [0, 0]);
  }
}

module.exports = NullCommand;
