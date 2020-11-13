'use strict';
// BaseController
const to = require('await-to-js').default;
const Utils = require('../../utils');
const DBUtil = require('../../utils/Database');
const HttpUtil = require('../../utils/http');

class BaseController {
  constructor(child) {
    this.selection = null
    this.softDelete = false
    this.filters = {}
    this.requireParams = {
      store: [],
      update: [],
      delete: [{name: 'ids', dataType: 'array'}]
    }
    this.acceptFields = {
      store: [],
      update: []
    }
    this.validate = {
      unique: []
    }
    this.bindingMethods = this.bindingMethods.bind(this)
    this.bindingMethods(child)
  }

  async load(req, res, next, id) {
    let [err, object] = await to(this.model.load(id));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.Load_Detail_Failed', words: err.message});

    if (!object) return HttpUtil.unprocessable(res, {msg: 'Not_Exists.general', words: id})

    req.object = object;
    next();
  }

  async index(req, res) {
    // console.log('params', req.query)
    if (req.query.queryFilters) {
      let {queryFilters, ...conditions} = req.query;
      return this.queryFilters(res, conditions, true)
    }

    let {currentPage, pageSize, filters, sorting} = req.query;
    let page = currentPage ? parseInt(currentPage) : 0
    let perPage = pageSize ? parseInt(pageSize) : 500

    let options = {
      perPage: perPage,
      page: page,
      filters: {...this.filters},
      sorts: null
    }

    if (filters && Utils.isArray(filters) && filters.length) {
      let relations = this.model.getRelationShip();
      options = DBUtil.setFilters(options, filters, relations);
      if (relations.length && !Utils.isObjectEmpty(options.conditions)) {
        let conditions = options.conditions;
        for (let key in conditions) {
          let condition = conditions[key];
          let modelName = Utils.getModelName(key);
          if (modelName === "Agency") { // thông tin agency lưu ở bảng users
            modelName = "User"
          }
          // load relation models
          let ModelRelation = require(`../Models/${modelName}`);
          let [err, ids] = await to(ModelRelation.getIdsByCondition(condition));
          if (err) {
            let msg = `BaseController.index --- setFilters '${key}' failed: ${err.message}`;
            return HttpUtil.internalServerError(res, msg)
          }
          options.filters[key] = {$in: ids}
        }
      }
    }

    if (sorting && Utils.isArray(sorting) && sorting.length) {
      options = DBUtil.setSortConditions(options, sorting)
    }

    let err, rs;
    if (options.perPage === -1) { // get all data
      [err, rs] = await to(this.model.lists(options));
      if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.Load_Lists_Failed', words: err.message});

      return HttpUtil.success(res, rs);
    } else {
      [err, rs] = await to(Promise.all([
        this.model.lists(options, this.selection),
        this.model.getCount(options.filters)
      ]));
      
      if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.Load_Lists_Failed', words: err.message});
      rs = DBUtil.paginationResult(page, perPage, rs[0], rs[1], filters);

      return HttpUtil.success(res, rs);
    }
  }

  detail(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    return HttpUtil.success(res, Utils.cloneObject(object));
  }

  async store(req, res) {
    let params;
    if (this.requireParams.store.length) {
      params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.store);
      if (params.error) return HttpUtil.badRequest(res, params.error);
      params = Utils.getAcceptableFields(params, [...this.requireParams.store, ...this.acceptFields.store]);
    } else {
      params = req.body;
    }

    let err, msg;
    if (this.validate.unique.length) {
      for (let i = 0; i < this.validate.unique.length; i++) {
        let item = this.validate.unique[i];
        if (params[item.key]) {
          [err, msg] = await to(this.validateUnique(item, params));
          if (err) return HttpUtil.internalServerError(res, err.message)
          if (msg !== true) return HttpUtil.unprocessable(res, msg)
        }
      }
    }
    // validate value input, validate unique, permission ...
    let result;
    [err, result] = await to(this.model.insertOne(params, req.authUser));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.create', words: err.message});
    delete result.__v; // not copy version;

    return HttpUtil.success(res, result, 'Success.create');
  }

  async update(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    let params;
    if (this.requireParams.update.length) {
      params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.update);
      if (params.error) return HttpUtil.badRequest(res, params.error);
      params = Utils.getAcceptableFields(params, [...this.requireParams.update, ...this.acceptFields.update]);
    } else {
      params = req.body;
    }

    let err, msg;
    if (this.validate.unique.length) {
      for (let i = 0; i < this.validate.unique.length; i++) {
        let item = this.validate.unique[i];
        if (params[item.key] && object[item.key] && params[item.key] !== object[item.key]) {
          [err, msg] = await to(this.validateUnique(item, params));
          if (err) return HttpUtil.internalServerError(res, err.message)
          if (msg !== true) return HttpUtil.unprocessable(res, msg)
        }
      }
    }

    delete params._id; // not update _id
    // validate value input, validate unique, permission ...
    let result;
    [err, result] = await to(this.model.updateOne(object._id, params, {}, req.authUser));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.update', words: err.message});

    return HttpUtil.success(res, 'Success.update');
  }

  async destroy(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    let err, result;
    let condition = {_id: object._id};
    if (!this.softDelete) {
      // [err, result] = await to(this.model.delete(object._id))
      [err, result] = await to(this.model.deleteByCondition(condition))
    } else {
      [err, result] = await to(this.model.softDeletes(condition, req.authUser))
    }
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.delete', words: err.message});

    return HttpUtil.success(res, 'Success.delete');
  }

  async deleteMulti(req, res) {
    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.delete);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    params = Utils.getAcceptableFields(params, this.requireParams.delete);
    let condition = {_id: {$in: params.ids}};
    let err, result;
    if (!this.softDelete) {
      [err, result] = await to(this.model.deleteByCondition(condition))
    } else {
      [err, result] = await to(this.model.softDeletes(condition, req.authUser, true))
    }
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.delete', words: err.message});

    return HttpUtil.success(res, 'Success.delete');
  }

  async queryFilters(res, conditions, lookup = false) {
    let [err, result] = await to(this.model.findByCondition(conditions, lookup));
    if (err) return HttpUtil.internalServerError(res, err);

    return HttpUtil.success(res, result)
  }

  async validateUnique(item, params) {
    let condition = {};
    condition[item.key] = params[item.key];
    let [err, exist] = await to(this.model.getOne(condition));
    if (err) throw Error(Utils.localizedText(item.err, item.message))
    if (exist) return Utils.localizedText(item.message, params[item.key])
    return true;
  }

  bindingMethods(obj) {
    let methods = Object.getOwnPropertyNames(obj.prototype);
    methods = methods.filter(x => (x !== 'constructor' && x !== 'bindingMethods' && x !== 'validateUnique'));

    for (let method of methods) {
      this[method] = this[method].bind(this)
    }
  }
}

module.exports = BaseController
