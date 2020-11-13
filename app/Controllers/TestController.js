'use strict';

const to = require('await-to-js').default;
const BaseController = require('./BaseController');
const HttpUtil = require('../../utils/http');
const ServiceTrans = require('../services/transactions');

class Controller extends BaseController {
  constructor() {
    super(Controller)
    this.seviceTrans = ServiceTrans;
  }

  async test(req, res) {
    let [err, result] = await to(this.seviceTrans.loadData());
    if (err) return HttpUtil.unprocessable(res, err)
    return HttpUtil.success(res, result)
  }
}

module.exports = new Controller()
