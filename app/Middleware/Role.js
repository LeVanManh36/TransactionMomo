const BaseMiddleware = require("./Base");
const RoleUtil = require('../../utils/roles');

class RoleMiddleware extends BaseMiddleware {
  handle(req, res, next) {
    RoleUtil.checkRole(req, res, next, this._params)
  }
}

module.exports = RoleMiddleware
