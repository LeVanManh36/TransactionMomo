const to = require('await-to-js').default;
const HttpUtil = require('../../../utils/http');
const Utils = require('../../../utils');
const BaseController = require('../Base');
const Service = require('../../services/gRpc/auth');
const {roles} = require('../../../config');

class AuthController extends BaseController {
  constructor() {
    super(AuthController);
    this.service = Service;
  }

  async register(req, res) {
    const requireParams = ['email', 'name', 'password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let {email, name, password} = params;
    let [err, result] = await to(this.service.register({email, name, password}));
    if (err) return HttpUtil.internalServerError(res, Utils.localizedText('Errors.register', err.message));

    return HttpUtil.forwardResponse(res, result);
  }

  async login(req, res) {
    const requireParams = ['username', 'password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let {username, password} = params;
    let [err, result] = await to(this.service.login({username, password}));
    if (err) return HttpUtil.unauthorized(res, err);

    return HttpUtil.forwardResponse(res, result);
  }

  async logout(req, res) {
    let token = Utils.getBearerTokenFromHeader(req);
    let [err, result] = await to(this.service.logout(token));
    if (err) return HttpUtil.unprocessable(res, err);

    return HttpUtil.forwardResponse(res, result);
  }

  async changePassword(req, res) {
    const requireParams = ['old_password', 'new_password', 'retype_password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let {old_password, new_password, retype_password} = params;
    if (!Utils.compareString(new_password, retype_password)) {
      return HttpUtil.badRequest(res, "Errors.Pw_Not_Match");
    }
    if (Utils.compareString(old_password, new_password)) {
      return HttpUtil.badRequest(res, 'Errors.New_Old_Pw_Must_Different');
    }
    let authUser = req.authUser;
    let [err, result] = await to(this.service.changePassword({userId: authUser._id, old_password, new_password}));
    if (err) return HttpUtil.unauthorized(res, err);

    return HttpUtil.forwardResponse(res, result);
  }

  async resetPassword(req, res) {
    let authUser = req.authUser;
    if ([roles.root, roles.admin].indexOf(authUser.role) === -1) {
      return HttpUtil.forbidden(res, 'Permission_Denied');
    }
    const requireParams = ['userId', 'new_password', 'retype_password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    if (!Utils.compareString(params.new_password, params.retype_password)) {
      return HttpUtil.badRequest(res, "Errors.Pw_Not_Match");
    }

    let {userId, new_password} = params;
    let [err , user] = await to(this.service.getUser({_id: userId}));
    if (err) return HttpUtil.unprocessable(res, err.message);
    if (!user || user.delete) {
      return HttpUtil.unprocessable(res, Utils.localizedText('Errors.Reset_Password'))
    }

    let result;
    let options = {userId: user._id, new_password};
    [err, result] = await to(this.service.resetPassword(options));
    if (err) return HttpUtil.unauthorized(res, err);

    return HttpUtil.forwardResponse(res, result);
  }
}

module.exports = new AuthController();
