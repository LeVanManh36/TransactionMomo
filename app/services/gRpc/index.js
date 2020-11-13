'use strict';

const moment = require('moment');

class Service {

  fetch(gRpcClient, options, fn = 'list') {
    return new Promise((resolve, reject) => {
      gRpcClient.fetch({ options: JSON.stringify(options), methodName: fn }, (err, result) => {
        if (err) return reject(err)

        return resolve(result)
      })
    })
  }

  lists(gRpcClient, options) {
    options = JSON.stringify(options);
    return this.fetch(gRpcClient, {options})
  }

  detail(gRpcClient, itemId) {
    return this.fetch(gRpcClient, {params: itemId}, 'detail')
  }

  filters(gRpcClient, conditions) {
    conditions = JSON.stringify(conditions);
    return this.fetch(gRpcClient, {conditions}, 'filter')
  }

  update(gRpcClient, options) {
    options = JSON.stringify(options);
    return this.fetch(gRpcClient, {options}, 'update')
  }

  formatDiscount(lists) {
    if (Array.isArray(lists)) {
      lists = lists.map(item => {
        item.discount = this.getDiscount(item.discount)
        return item;
      });
    } else { // using format after call method detail
      lists.discount = this.getDiscount(lists.discount)
    }
    return lists
  }

  getDiscount(discount) {
    let value = discount.default || 0;
    let today = moment().format('YYYY-MM-DD')
    if (discount.startDate && discount.endDate && discount.startDate !== '' && discount.endDate !== '') {
      if (today >= discount.startDate && today <= discount.endDate) {
        value = discount.value
      }
    }
    return value
  }
}

module.exports = new Service()
