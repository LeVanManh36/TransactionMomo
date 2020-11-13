'use strict';

const to = require('await-to-js').default;

class Service {
  constructor() {
    this.serviceName = "gRpcClient";
  }

  fetch(gRpcClient, options, fn = 'fetch') {
    return new Promise((resolve, reject) => {
      gRpcClient[fn](options, (err, result) => {
        if (err) {
          let {code, details, message} = err
          return reject({code, message: details, details: message})
        }
        return resolve(result)
      })
    })
  }

  async fetchApi(gRpcClient, options, methodName) {
    options = JSON.stringify(options);
    let [err, result] = await to(this.fetch(gRpcClient, {options, methodName}));
    if (err) {
      console.log(`${this.serviceName} call method '${methodName}' error:`, err);
      throw Error(err.message)
    }
    // console.log(`${this.serviceName} call method '${methodName}' result:`, result);
    if (result.data) result.data = JSON.parse(result.data);
    return result
  }

  lists(gRpcClient, options) {
    options = JSON.stringify(options);
    return this.fetch(gRpcClient, {options}, 'list')
  }
}

module.exports = Service
