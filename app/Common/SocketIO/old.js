'use strict';

const Base = require('./base');

class Connection extends Base {
  constructor() {
    super(Connection);
    this.isNewVersion = false
  }
}

module.exports = new Connection()
