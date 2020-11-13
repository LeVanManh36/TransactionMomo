'use strict';

const Base = require('./base');

class Connection extends Base {
  constructor() {
    super(Connection);
    this.isNewVersion = true
  }
}

module.exports = new Connection()
