'use strict'

const to = require('await-to-js').default;
const HttpUtil = require('../../../utils/http');
const Utils = require('../../../utils');
const BaseController = require('../Base');
const Service = require('../../services/gRpc/auth');
const {roles} = require('../../../config');

/*
 Quản lý tài khoản admin
 */
class AccountController extends BaseController {
  constructor() {
    super(AccountController);
    this.service = Service;
    this.requireParams = {
      ...this.requireParams,
      store: [
        'email',
        'name',
        'phone',
        'password',
        'confirmPassword'
      ],
      update: [
        'email',
        'name',
        'phone',
      ]
    }
    this.acceptFields = {
      store: ['address', 'description'],
      update: ['address', 'description']
    }
    this.filters = {role: roles.admin}
    this.validate = {
      unique: [
        {
          key: 'email',
          error: 'Found_Errors.user',
          message: 'Unique.user.email'
        }
      ]
    }
  }

  async load(req, res, next, id) {
    let [err, object] = await to(this.service.getUser({_id: id}));
    if (err) return HttpUtil.unprocessable(res, err.message);

    if (!object) return HttpUtil.unprocessable(res, Utils.localizedText('Not_Exists.user', id))

    object = Utils.cloneObject(object);
    req.object = object;
    next();
  }

  async index(req, res) {
    let {currentPage, pageSize, filters, sorting} = req.query;
    let page = currentPage ? parseInt(currentPage) : 0
    let perPage = pageSize ? parseInt(pageSize) : 500

    let options = {
      perPage: perPage,
      page: page,
      conditions: {...this.filters}
    }

    if (filters && Utils.isArray(filters) && filters.length) {
      options.filters = filters;
    }
    if (sorting && Utils.isArray(sorting) && sorting.length) {
      options.sorts = sorting
    }

    let [err, result] = await to(this.service.listUsers(options));
    if (err) return HttpUtil.internalServerError(res, err);

    return HttpUtil.forwardResponse(res, result)
  }

  detail(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    return HttpUtil.success(res, object);
  }

  async store(req, res) {
    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.store);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    params = Utils.getAcceptableFields(params, [...this.requireParams.store, ...this.acceptFields.store]);
    let {password, confirmPassword, ...others} = params;
    if (!Utils.compareString(password, confirmPassword)) {
      return HttpUtil.badRequest(res, "Errors.Pw_Not_Match");
    }

    let err, result;
    [err, result] = await to(this.service.getUser({email: params.email}));
    if (err) return HttpUtil.unprocessable(res, err.message);
    if (result) return HttpUtil.unprocessable(res, Utils.localizedText('Unique.user.email', params.email));

    let obj = {
      ...others,
      role: roles.admin,
      password: password
    };

    [err, result] = await to(this.service.createUser(obj));
    if (err) return HttpUtil.unprocessable(res, err.message);
    result = Utils.cloneObject(result);
    delete result.__v; // not copy version;

    return HttpUtil.success(res, result, 'Success.create');
  }

  async update(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.update);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    params = Utils.getAcceptableFields(params, [...this.requireParams.update, ...this.acceptFields.update]);
    let err, result;
    if (params.email !== object.email) {
      [err, result] = await to(this.service.getUser({email: params.email}));
      if (err) return HttpUtil.unprocessable(res, err.message);
      if (result) return HttpUtil.unprocessable(res, Utils.localizedText('Unique.user.email', params.email));
    }

    [err, result] = await to(this.service.updateUser({_id: object._id}, params));
    if (err) return HttpUtil.unprocessable(res, err.message);

    return HttpUtil.success(res, 'Success.update');
  }

  async destroy(req, res) {
    let object = req.object;
    if (!object) return HttpUtil.badRequest(res, 'Not_Founds.Request_Object')

    let [err, result] = await to(this.service.deleteUser(object._id, this.softDelete));
    if (err) return HttpUtil.unprocessable(res, err.message);

    return HttpUtil.success(res, 'Success.delete');
  }

  async deleteMulti(req, res) {
    let params = HttpUtil.getRequiredParamsFromJson2(req, this.requireParams.delete);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let [err, result] = await to(Promise.all(params.ids.map(id => this.service.deleteUser(id, this.softDelete))));
    if (err) return HttpUtil.unprocessable(res, err.message);

    return HttpUtil.success(res, 'Success.delete');
  }
}

module.exports = new AccountController()
