'use strict';

const to = require('await-to-js').default;
const BaseService = require('./BaseServer');
const HttpUtil = require('../../../utils/http');
const FileUtil = require('../../../utils/files');
const config = require('../../../config');
const ServiceDeploy = require('../deploy');
// const Model = require('../../Models/Area');

class Service extends BaseService {
  constructor() {
    super(Service)
    this.serviceDeploy = ServiceDeploy;
    // this.model = Model;
  }

  async lists(call, callback) {
    return super.lists(call, callback)
  }

  async fetch(call, callback) {
    return super.fetch(call, callback);
  }

  async execCampaign(cb, conditions) {
    let requireParams = [
      'cpuSerialNumber',
      {name: 'assets', dataType: 'array'},
      {name: 'playlists', dataType: 'array'}
    ];

    let params = HttpUtil.checkRequiredParams2(conditions, requireParams);
    if (params.error) {
      return this.response(cb, {code: HttpUtil.BAD_REQUEST, message: params.error})
    }

    let [err, rs] = await to(this.serviceDeploy.autoSync(params));
    if (err) {
      return this.response(cb, {code: HttpUtil.UNPROCESSABLE_ENTITY, message: err.message || err})
    }

    return this.response(cb, {data: rs})
  }

  async getDeviceLog(cb, conditions) {
    let {date, cpuSerialNumber} = conditions;
    if (!date) {
      return this.response(cb, {code: HttpUtil.BAD_REQUEST, message: "Param date is missing"});
    }
    if (!cpuSerialNumber) {
      return this.response(cb, {code: HttpUtil.BAD_REQUEST, message: "Param cpuSerialNumber is missing"});
    }

    let file = `${date}.json`;
    let filePath = `${config.dailyLogDir}/${cpuSerialNumber}/${file}`;
    let exist = FileUtil.checkExists(filePath);
    if (!exist) {
      // console.log('Not file exist', filePath);
      return this.response(cb, {data: [], stringify: true});
    }

    let [err, data] = await to(FileUtil.readFile(filePath));
    if (err) return this.response(cb, {code: HttpUtil.UNPROCESSABLE_ENTITY, message: err.message || err});
    return this.response(cb, {data})
  }

  // Dự án quảng cáo chung cư.
  async execCampaignDACC(cb, conditions) {
    let requireParams = [
      'cpuSerialNumber',
      'link',
      {name: 'assets', dataType: 'array'}
    ];

    let params = HttpUtil.checkRequiredParams2(conditions, requireParams);
    if (params.error) {
      return this.response(cb, {code: HttpUtil.BAD_REQUEST, message: params.error})
    }

    let [err, rs] = await to(this.serviceDeploy.autoSyncDACC(params));
    if (err) {
      return this.response(cb, {code: HttpUtil.UNPROCESSABLE_ENTITY, message: err.message || err})
    }

    return this.response(cb, {data: rs})
  }
}

module.exports = new Service()
