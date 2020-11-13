'use strict'

const to = require('await-to-js').default;
const HttpUtil = require('../../../utils/http');
const Utils = require('../../../utils');
const BaseController = require('../Base');
const Company = require('../../Models/Company');
const Service = require('../../services/gRpc/auth');
const {roles} = require('../../../config');

/*
 *** Quản lý tài khoản khác admin
 */
class UserController extends BaseController {
  constructor() {
    super(UserController);
    this.mCompany = Company;
    this.service = Service;
    this.requireParams = {
      ...this.requireParams,
      store: [
        'email',
        'name',
        'phone',
        'role',
        'company',
        'password',
        'confirmPassword'
      ],
      update: [
        'email',
        'name',
        'phone',
        'role',
        'company'
      ]
    }
    this.acceptFields = {
      store: ['address', 'description'],
      update: ['address', 'description']
    }
    this.filters = {role: {$nin: [roles.root, roles.admin]}}
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
      let condition = null;
      filters.map((item, index) => {
        if (item.columnName === "company") {
          condition = {name: new RegExp(this.escapeRegExp(String(item.value).trim()), 'i')}
          filters.splice(index, 1)
        }
      })
      if (condition) {
        let [err, ids] = await to(this.mCompany.getIdsByCondition(condition));
        if (err) {
          let msg = `--- setFilters company failed: ${err.message}`;
          return HttpUtil.internalServerError(res, msg)
        }

        filters.push({columnName: "company", dataType: "arrayValue", value: ids, operation: "includes"});
        options.filters = filters
      } else {
        options.filters = filters
      }
    }
    if (sorting && Utils.isArray(sorting) && sorting.length) {
      options.sorts = sorting
    }

    let [err, result] = await to(this.service.listUsers(options));
    if (err) return HttpUtil.internalServerError(res, err);
    // map company info
    if (result.code === HttpUtil.OK && result.data.list_data.length) {
      let {list_data} = result.data;
      let companies;
      [err, companies] = await to(this.mCompany.findByCondition({_id: {$in: list_data.map(item => item.company)}}));
      if (err) return HttpUtil.internalServerError(res, Utils.localizedText('Load_Lists_Errors.user', err.message));

      let options = {};
      companies.map(company => {
        let {_id, name} = company;
        options[_id.toString()] = {_id, name}
      });
      list_data = list_data.map(item => {
        let key = item.company.toString();
        if (options[key]) item.company = options[key];
        return item
      })
      result.data.list_data = list_data

      return HttpUtil.forwardResponse(res, result)
    } else {
      return HttpUtil.forwardResponse(res, result)
    }
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

  async getRoles(req, res) {
    let rs = [];
    for (let key in roles) {
      if (['admin', 'root'].indexOf(key) > -1) continue;
      rs.push({
        value: roles[key],
        label: Utils.localizedText(`Roles.${key}`)
      })
    }
    return HttpUtil.success(res, rs)
  }
}

module.exports = new UserController()
