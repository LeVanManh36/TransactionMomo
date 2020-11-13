'use strict';

const to = require('await-to-js').default;
const HttpUtil = require('../../utils/http');
const Utils = require('../../utils');
const BaseController = require('./BaseController');
const Model = require('../Models/Company');
const ModelUser = require('../Models/User');

/**
 * Xem hàm mẫu BaseController nếu muốn viết lại các action
 */

class Controller extends BaseController {
  constructor() {
    super(Controller)
    this.model = Model;
    this.mUser = ModelUser;
    this.requireParams = {
      ...this.requireParams,
      store: ['name', 'email', 'phone', 'address'],
      update: ['name', 'email', 'phone', 'address']
    }
    this.acceptFields = {
      ...this.acceptFields,
      store: ['enableLog', 'enableTracking', 'description', 'storageConfig'],
      update: ['enableLog', 'enableTracking', 'description', 'storageConfig']
    }
    this.validate = {
      unique: [
        {
          key: 'name',
          error: 'Found_Errors.company',
          message: 'Exists.company'
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
    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.store);
    if (params.error) return HttpUtil.badRequest(res, params.error);
    params = Utils.getAcceptableFields(params, [...this.requireParams.store, ...this.acceptFields.store]);

    let condition = {name: params.name};
    let [err, exist] = await to(this.model.getOne(condition));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Found_Errors.company', words: err.message});
    if (exist) return HttpUtil.unprocessable(res, {msg: 'Exists.company', words: params.name});

    let company;
    [err, company] = await to(this.model.insertOne(params, req.authUser));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.create', words: err.message});
    delete company.__v; // not copy version;

    return HttpUtil.success(res, company, 'Success.create')
  }

  async update(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object');

    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.update);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    params = Utils.getAcceptableFields(params, [...this.requireParams.update, ...this.acceptFields.update]);
    let err, msg;
    for (let i = 0; i < this.validate.unique.length; i++) {
      let item = this.validate.unique[i];
      if (params[item.key] && object[item.key] && params[item.key] !== object[item.key]) {
        [err, msg] = await to(this.validateUnique(item, params));
        if (err) return HttpUtil.internalServerError(res, err.message)
        if (msg !== true) return HttpUtil.unprocessable(res, msg)
      }
    }

    let result;
    [err, result] = await to(this.model.updateOne(object._id, params, {}, req.authUser));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.update', words: err.message});

    return HttpUtil.success(res, 'Success.update')
  }

  async destroy(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object');

    let err, result;
    let condition = {_id: object._id};
    let conditionRelation = {company: object._id};
    if (!this.softDelete) {
      [err, result] = await to(Promise.all([
        this.model.deleteByCondition(condition),
        this.mUser.deleteByCondition(conditionRelation)
      ]))
    } else {
      let authUser = req.authUser;
      [err, result] = await to(Promise.all([
        this.model.softDeletes(condition, authUser),
        this.mUser.softDeletes(conditionRelation, authUser)
      ]))
    }
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.delete', words: err.message});

    return HttpUtil.success(res, 'Success.delete');
    // return super.destroy(req, res)
  }

  async deleteMulti(req, res) {
    return super.deleteMulti(req, res)
  }
}

module.exports = new Controller()
