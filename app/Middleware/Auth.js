const AuthUtil = require("../../utils/auth");
const HttpUtil = require('../../utils/http');
const Utils = require('../../utils');
const User = require('../Models/User');
const FIELDS = ['_id', 'email', 'name', 'role'];
const TAG = '[Header-Validation]';

class AuthMiddleware {
  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  handle(req, res, next) {
    let ret = Utils.getBearerTokenFromHeader(req);
    if (ret.error) {
      // console.log('ret', ret.error)
      return HttpUtil.unauthorized(res, ret.error);
    }

    try {
      AuthUtil.verify(ret.token, (err, payload) => {
        if (err) {
          // console.log('JWT error:', Object.assign({}, err));
          err = {message: `${err.name}: ${err.message}`};

          return HttpUtil.unauthorized(res, err);
        }
        // find authUser;
        User.loadCb(
          payload._id,
          (err, user) => {
            if (err) {
              return HttpUtil.internalServerError(res, {msg: 'Found_Errors.user', words: err.message});
            }
            if (!user || (user.delete && user.delete.when)) {
              return HttpUtil.unauthorized(res, 'unauthenticated');
            }
            if (user.disable || (payload.iat * 1000) <= parseInt(user.lastPasswordChange)) {
              return HttpUtil.unauthorized(res);
            }

            user = Utils.cloneObject(user.getFields(FIELDS));

            req.authUser = user;
            next();
          }
        )
      })
    } catch (err) {
      console.log(TAG + ' checkAccessToken error ', err);
      return HttpUtil.internalServerError(res, err)
    }
  }
}

module.exports = new AuthMiddleware()
