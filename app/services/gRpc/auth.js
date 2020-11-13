'use strict';

const to = require('await-to-js').default;
const HttpUtil = require('../../../utils/http');
const BaseClient = require('./BaseClient');
const gRpcProvider = require('../../../services/grpc/clients');
const {API_AUTH_KEY} = require('../../../config/gRpc');

class ServiceClient extends BaseClient {
  constructor() {
    super(ServiceClient)
    this.serviceName = "AuthService"
    this._providers = {
      auth: "authClient",
      user: "userClient"
    }
  }

  async callAuthService(options, methodName = "login") {
    let serviceName = this._providers.auth;
    let gRpcClient = gRpcProvider[serviceName];
    options.secret = API_AUTH_KEY;
    let [err, result] = await to(this.fetchApi(gRpcClient, options, methodName));
    if (err) throw Error(err.message);
    return result
  }

  async register(options) {
    return this.callAuthService(options, "register")
  }

  async login(options) {
    return this.callAuthService(options)
  }

  async logout(options) {
    return this.callAuthService(options, "logout")
  }

  async checkTokens(options) {
    return this.callAuthService(options, "checkTokens")
  }

  async changePassword(options) {
    return this.callAuthService(options, "changePassword")
  }

  async resetPassword(options) {
    return this.callAuthService(options, "resetPassword")
  }
  
  async callUserService(options, methodName = "detail") {
    let serviceName = this._providers.user;
    let gRpcClient = gRpcProvider[serviceName];
    options.secret = API_AUTH_KEY;
    let [err, result] = await to(this.fetchApi(gRpcClient, options, methodName));
    if (err) throw Error(err.message);
    if (result.code !== HttpUtil.OK) throw Error(result.message);
    return result.data || (methodName !== "detail" ? result.message : null)
  }

  async getUser(options) {
    return this.callUserService(options)
  }

  async createUser(options) {
    return this.callUserService(options, "store")
  }

  async updateUser(condtions, dataSet, dataUnset = {}, multi = false) {
    let data = {$set: dataSet};
    if (dataUnset && Object.keys(dataUnset).length) data = {...data, $unset: dataUnset};
    let options = {
      condition: condtions,
      data: data,
      multi: multi
    };
    return this.callUserService(options, "update")
  }

  async deleteUser(userId, softDelete = false) {
    let options = {userId, softDelete};
    return this.callUserService(options, "destroy")
  }

  async listUsers(options) {
    let serviceName = this._providers.user;
    let gRpcClient = gRpcProvider[serviceName];
    options.secret = API_AUTH_KEY;
    let [err, result] = await to(this.lists(gRpcClient, options));
    if (err) throw Error(err.message);
    return result
  }
}

module.exports = new ServiceClient()
