'use strict';

// const moment = require('moment');
const to = require('await-to-js').default;
const HttpUtil = require('../../../utils/http');
const BaseClient = require('./BaseClient');
const gRpcProvider = require('../../../services/grpc/clients');
const {API_FILE_KEY} = require('../../../config/gRpc');

class FileGRPCClient extends BaseClient {
  constructor() {
    super(FileGRPCClient)
    this.serviceName = "FileService"
    this._providers = {
      file: "fileClient",
    }
  }

  async callFileService(options, methodName = "login") {
    options.secret = API_FILE_KEY;
    const serviceName = this._providers.file;
    const gRpcClient = gRpcProvider[serviceName];
    const [err, result] = await to(this.fetchApi(gRpcClient, options, methodName));
    if (err) throw Error(err.message);

    return result
  }

  async storeFiles (options) {
    return this.callFileService(options, 'store');
  }

  async listFiles (options) {
    options.secret = API_FILE_KEY;
    const serviceName = this._providers.file;
    const gRpcClient = gRpcProvider[serviceName];
    let [err, result] = await to(this.lists(gRpcClient, options));
    if (err) throw Error(err.message);

    return result
  }

  async filters (options) {
    return this.callFileService(options, 'lists');
  }

  async getFile (options) {
    return this.callFileService(options, 'detail');
  }

  async updateFile (options) {
    return this.callFileService(options, 'update');
  }

  async deleteFile (options) {
    return this.callFileService(options, 'destroy');
  }
}

module.exports = new FileGRPCClient()
