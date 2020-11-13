const AuthUtil = require("../../utils/auth");
const HttpUtil = require('../../utils/http');
const Utils = require('../../utils');
const User = require('../Models/User');
const Company = require('../Models/Company');
const Service = require('../services/gRpc/auth');
const {AUTH_TYPE} = require('../../config');
const FIELDS = ['_id', 'email', 'name', 'role', 'company'];
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

    if (AUTH_TYPE === "local") {
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
              if (user.company) {
                user.companyInfo = Utils.cloneObject(user.company);
                user.company = user.company._id;
              }

              req.authUser = user;
              next();
            }
          )
        })
      } catch (err) {
        console.log(TAG + ' checkAccessToken error ', err);
        return HttpUtil.internalServerError(res, err)
      }
    } else {
      Service.checkTokens(ret)
        .then(result => {
          if (result.code === HttpUtil.OK) {
            let {authUser} = result.data;
            req.authUser = authUser;
            if (authUser.company) {
              Company.getOne({_id: authUser.company})
                .then(result => {
                  req.authUser.companyInfo = result;
                  next()
                })
                .catch(err => {
                  return HttpUtil.internalServerError(res, {msg: 'Found_Errors.company', words: err.message})
                })
            } else {
              next()
            }
          } else {
            return HttpUtil.forwardResponse(res, result)
          }
        })
        .catch(err => {
          return HttpUtil.unauthorized(res, err)
        })
    }
  }
}

module.exports = new AuthMiddleware()
