'use strict';

const to = require('await-to-js').default;
const BaseService = require('./Base');
const ModelTransaction = require('../Models/Transaction');
const {loadData} = require('../../services/transactions');
const certificate = {
  user: process.env.MOMO_MAIL,
  pass: process.env.MOMO_MAIL_PASS
}

class Transaction extends BaseService {
  constructor() {
    super(Transaction)
    this.model = ModelTransaction;
  }

  async loadData(auth = null) {
    if (!auth) auth = certificate;
    let [err, data] = await to(loadData(auth));
    if (err) throw Error(err.message || err);

    let result;
    [err, result] = await to(Promise.all(data.map(obj => this.model.insertOne(obj))));
    if (err) throw Error(err.message || err)
    return result
  }
}

module.exports = new Transaction()
