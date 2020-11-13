"use strict"

const {AUTH_TYPE, API_AUTH_KEY} = require('./env/gRpc');

module.exports = {
  // *** config server *** //
  AUTH_TYPE,
  API_AUTH_KEY,
  // *** API_KEY_CLIENT *** //
  APP_KEY: {
    "key": "scope_name",
  }
}
