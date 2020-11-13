'use strict';

const to = require('await-to-js').default;
const BaseController = require('./BaseController');
const HttpUtil = require('../../utils/http');

class Controller extends BaseController {
  constructor() {
    super(Controller)
  }

  async test(req, res) {
    return HttpUtil.success(res, {msg: "Done"})
  }
}

module.exports = new Controller()
