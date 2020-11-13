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
    console.log('====================== start:', new Date())
    if (!auth) auth = certificate;
    let [err, data] = await to(loadData(auth));
    if (err) throw Error(err.message || err);
    console.log('====================== end:', new Date())
    if (!data.length) return {count: 0};
    let result;
    let transIds = data.map(item => item.momoTransId);
    [err, result] = await to(this.model.findByCondition({momoTransId: {$in: transIds}}));
    if (err) throw Error(err.message);
    if (result.length) {
      transIds = result.map(item => item.momoTransId);
      data = data.filter(item => transIds.indexOf(item.momoTransId) === -1);
    }

    if (!data.length) return {count: 0};
    [err, result] = await to(Promise.all(data.map(obj => this.model.insertOne(obj))));
    if (err) throw Error(err.message);
    return result
  }
}

module.exports = new Transaction()
