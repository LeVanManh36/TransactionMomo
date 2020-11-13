'use strict';

const to = require('await-to-js').default;
const DBUtil = require('../../../utils/Database');
const ExcelUtil = require('../../../utils/excel');
const HttpUtil = require('../../../utils/http');
const Utils = require('../../../utils');
const BaseService = require('./BaseServer');
const Model = require('../../Models/Player');
const ModelCompany = require('../../Models/Company');
const ModelGroup = require('../../Models/Group');
const ServiceGroup = require('../Export/groups');
const {baseUrl, mediaDefault} = require('../../../config');
const {APP_KEY} = require('../../../config/gRpc');
const statusCode = {
  INVALID_ARGUMENT: 3,
  UNIMPLEMENTED: 12
};

class Service extends BaseService {
  constructor() {
    super(Service)
    this.model = Model;
    this.mCompany = ModelCompany;
    this.mGroup = ModelGroup;
    this.service = ServiceGroup;
  }

  async lists(call, callback) {
    // return super.lists(call, callback)
    let {options} = call.request;
    options = options ? JSON.parse(options) : {};
    let {page, perPage, conditions = {}, filters = [], sorts = [], secret} = options;

    if (!secret || !APP_KEY[secret]) {
      let msg = HttpUtil.createError(HttpUtil.METHOD_NOT_ALLOWED, `System is not supported`);
      return this.response(callback, msg)
    }

    let [err, rs] = await to(this.mCompany.getOne({code: APP_KEY[secret]}));
    if (err) {
      rs = {code: HttpUtil.INTERNAL_SERVER_ERROR, message: err.message}
      return this.response(callback, rs)
    }
    if (!rs) {
      rs = HttpUtil.createError(HttpUtil.UNPROCESSABLE_ENTITY, 'Not_Exists.company', APP_KEY[secret]);
      return this.response(callback, rs)
    }

    conditions = {...conditions, company: rs._id}
    options = {
      page: page,
      perPage: perPage,
      filters: conditions,
      sorts: null
    }
    if (filters.length) {
      options = DBUtil.setFilters(options, filters)
    }
    if (sorts.length) {
      options = DBUtil.setSortConditions(options, sorts)
    }

    [err, rs] = await to(Promise.all([
      this.model.lists(options),
      this.model.getCount(options.filters)
    ]));
    if (err) {
      rs = {code: HttpUtil.INTERNAL_SERVER_ERROR, message: err.message}
    } else {
      rs = {data: DBUtil.paginationResult(page, perPage, rs[0], rs[1], filters), stringify: false}
    }
    return this.response(callback, rs);
  }

  async fetch(call, callback) {
    // return super.fetch(call, callback)
    let params = HttpUtil.checkRequiredParams2(call.request, ["options", "methodName"]);
    if (params.error) return this.response(callback, HttpUtil.createErrorInvalidInput(params.error));
    let {options, methodName} = params;
    options = options ? JSON.parse(options) : {};
    let msg;
    if (Utils.isObjectEmpty(options)) {
      msg = HttpUtil.createErrorInvalidInput('Params options must be a non-blank object');
      return this.response(callback, msg)
    }
    if (!this._methods.includes(methodName)) {
      msg = `Service '${methodName}' is not defined`;
      return this.error(callback, msg, statusCode.UNIMPLEMENTED)
    }
    let {secret} = options;
    if (!secret || !APP_KEY[secret]) {
      msg = HttpUtil.createError(HttpUtil.METHOD_NOT_ALLOWED, `System is not supported`);
      return this.response(callback, msg)
    }
    let [err, company] = await to(this.mCompany.getOne({code: APP_KEY[secret]}));
    if (err) {
      msg = {code: HttpUtil.INTERNAL_SERVER_ERROR, message: err.message}
      return this.response(callback, msg)
    }
    if (!company) {
      msg = HttpUtil.createError(HttpUtil.UNPROCESSABLE_ENTITY, 'Not_Exists.company', APP_KEY[secret]);
      return this.response(callback, msg)
    }
    options.company = company._id;
    delete options.secret;
    return await this[methodName](callback, options)
  }

  async getDataSchedule(conditions) {
    let {date, cpuSerialNumber} = conditions;
    let err, player, group, result;
    [err, player] = await to(this.model.getOne({cpuSerialNumber}));
    if (err) throw Error(Utils.localizedText('Found_Errors.device', err.message));
    if (!player) throw Error(Utils.localizedText('Not_Exists.device', conditions._id));
    let playerName = player.name || player.cpuSerialNumber;
    if (!player.company) throw Error(Utils.localizedText('Errors.device.Not_Company_Found', playerName));
    if (!player.group) throw Error(Utils.localizedText('Errors.device.Not_Group_Found', playerName));

    [err, group] = await to(this.mGroup.getOne({_id: player.group}, true));
    if (err) throw Error(Utils.localizedText('Found_Errors.group', err.message));
    if (!group) throw Error(Utils.localizedText('Not_Exists.group', player.group.toString()));

    [err, result] = await to(this.service.getScheduleDeployed(group, date));
    if (err) throw Error(err.message);

    return {...result, group, player};
  }

  async getSchedule(cb, conditions) {
    let [err, result] = await to(this.getDataSchedule(conditions));
    if (err) return this.response(cb, {code: HttpUtil.UNPROCESSABLE_ENTITY, message: err.message});

    let {schedule, date, player} = result;
    let urlFile = `${baseUrl}/files/${player.company.toString()}/${mediaDefault.assetFolder}/`;
    return this.response(cb, {data: {schedule, date, urlFile}})
  }

  async exportSchedule(cb, conditions) {
    let [err, result] = await to(this.getDataSchedule(conditions));
    if (err) return this.response(cb, {code: HttpUtil.UNPROCESSABLE_ENTITY, message: err.message});

    let {schedule, date, group} = result;
    let headers = this.service.getFileHeader();
    let sheets = {headers, listData: schedule, sheetName: date}
    let filename = `${Utils.localizedText('Filename.schedule', group.name)}__`;
    let data = ExcelUtil.exportExcel(filename, [sheets]);
    return this.response(cb, {data: data})
  }
}

module.exports = new Service()
