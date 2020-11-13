'use strict';

const BaseController = require('./BaseController');
const Model = require('../Models/Transaction');

/*
  Xem hàm mẫu BaseController nếu muốn viết lại các action
*/
class Controller extends BaseController {
  constructor() {
    super(Controller)
    this.model = Model;
  }

  async index(req, res) {
    return super.index(req, res)
  }
}

module.exports = new Controller()
