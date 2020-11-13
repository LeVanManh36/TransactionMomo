'use strict';

const BaseController = require('./BaseController');
const Model = require('../Models/Card');

/*
  Xem hàm mẫu BaseController nếu muốn viết lại các action
*/
class Controller extends BaseController {
  constructor() {
    super(Controller)
    this.model = Model;
    this.requireParams = {
      ...this.requireParams,
      store: ['name', 'phone', 'email', 'pwd'],
      update: ['name', 'phone', 'email', 'pwd']
    }
    this.acceptFields = {
      store: [],
      update: []
    }
    this.validate = {
      unique: [
        {
          key: 'phone',
          error: 'Found_Errors.card',
          message: 'Unique.card.phone'
        }
      ]
    }
  }

  async load(req, res, next, id) {
    return super.load(req, res, next, id)
  }

  async index(req, res) {
    return super.index(req, res)
  }

  detail(req, res) {
    return super.detail(req, res)
  }

  async store(req, res) {
    return super.store(req, res);
  }

  async update(req, res) {
    return super.update(req, res);
  }

  async destroy(req, res) {
    return super.destroy(req, res)
  }

  async deleteMulti(req, res) {
    return super.deleteMulti(req, res)
  }
}

module.exports = new Controller()
