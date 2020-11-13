'use strict';

const BaseService = require('./BaseServer');
const Model = require('../../Models/Area');

class Service extends BaseService {
  constructor() {
    super(Service)
    this.model = Model;
  }

  async lists(call, callback) {
    return super.lists(call, callback)
  }

  async fetch(call, callback) {
    return super.fetch(call, callback);
  }
}

module.exports = new Service()
