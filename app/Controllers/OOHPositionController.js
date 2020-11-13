'use strict';

const BaseController = require('./BaseController');
const Model = require('../Models/OOHPosition');

/*
  Xem hàm mẫu BaseController nếu muốn viết lại các action
*/
class OOHPositionController extends BaseController {
  constructor() {
    super(OOHPositionController)
    this.model = Model;
    this.requireParams = {
      ...this.requireParams,
      store: ['area', 'size', 'address'],
      update: ['area', 'size', 'address']
    }
    this.acceptFields = {
      store: ['vision', 'light', 'flow', 'description', 'packages.price', 'discount', 'link', 'lat', 'lng'],
      update: ['vision', 'light', 'flow', 'description', 'packages.price', 'discount', 'link', 'lat', 'lng']
    }
    this.validate = {
      unique: []
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

module.exports = new OOHPositionController()
