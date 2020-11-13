'use strict'

const to = require('await-to-js').default;
const AuthUtil = require('../../utils/auth');
const HttpUtil = require('../../utils/http');
const Utils = require('../../utils');
const BaseController = require('./Base');
const User = require('../Models/User');
const {roles, passwordDefault} = require('../../config');

class AuthController extends BaseController {
  constructor() {
    super(AuthController)
    this.model = User;
  }

  async register(req, res) {
    const requireParams = ['email', 'name', 'password']; // password phải được đặt cuối cùng.
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    const {email, name, password} = params;
    let [err, user] = await to(this.model.getOne({email: email}));
    if (err) {
      return HttpUtil.internalServerError(res, {msg: 'Found_Errors.user', words: err.message});
    }
    if (user) {
      return HttpUtil.unprocessable(res, {msg: 'Unique.user.email', words: params.email});
    }

    let {salt, hash} = AuthUtil.setPassword(password);
    let obj = {email, name, role: roles.admin, salt, hash};
    [err, user] = await to(this.model.insertOne(obj));
    if (err) {
      return HttpUtil.internalServerError(res, {msg: 'Errors.register', words: err.message});
    }

    user = user.getFields();
    user = Utils.cloneObject(user);
    const token = AuthUtil.generateJwt(user);

    return HttpUtil.success(res, {token: token, user}, 'Success.register');
  }

  async login(req, res) {
    const requireParams = ['username', 'password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let {username, password} = params;
    let condition = {$or: [{email: username}, {username: username}]};

    let [err, user] = await to(this.model.getOne(condition, true, {}));
    if (err) return HttpUtil.unauthorized(res, err);
    if (!user || user.delete) {
      return HttpUtil.unprocessable(res, {msg: 'Not_Exists.user', words: username})
    }
    if (user.disable) {
      return HttpUtil.unprocessable(res, 'Disable_Login')
    }
    if (!AuthUtil.validPassword(user, password)) {
      return HttpUtil.badRequest(res, 'Errors.Incorrect_Password');
    }

    let token = AuthUtil.generateJwt(user);
    ['hash', 'salt', '__v', 'update', 'insert'].forEach(field => delete user[field]);

    return HttpUtil.success(res, {token, user}, 'Success.login');
  }

  async logout(req, res) {
    return HttpUtil.success(res, "Success.general")
  }

  async changePassword(req, res) {
    const requireParams = ['old_password', 'new_password', 'retype_password'];
    let params = HttpUtil.getRequiredParamsFromJson2(req, requireParams);
    if (params.error) return HttpUtil.badRequest(res, params.error);
    if (!Utils.compareString(params.new_password, params.retype_password)) {
      return HttpUtil.badRequest(res, "Errors.Pw_Not_Match");
    }
    if (Utils.compareString(params.old_password, params.new_password)) {
      return HttpUtil.badRequest(res, 'Errors.New_Old_Pw_Must_Different');
    }

    let object = req.authUser;
    if (!object || !object._id) return HttpUtil.unauthorized(res, 'unauthorized');

    let err, user;
    [err, user] = await to(this.model.getOne({_id: object._id}, false, {}));
    if (err) {
      return HttpUtil.internalServerError(res, {msg: 'Found_Errors.user', words: err.message});
    }
    if (!user || user.delete) {
      return HttpUtil.unprocessable(res, {msg: 'Not_Exists.user', words: object._id});
    }
    if (!AuthUtil.validPassword(user, params.old_password)) {
      return HttpUtil.unprocessable(res, 'Errors.Old_Pw_Not_Match');
    }

    let objUpdate = AuthUtil.setPassword(params.new_password);
    objUpdate.lastPasswordChange = Date.now();
    [err, user] = await to(this.model.updateOne(user._id, objUpdate));
    if (err) return HttpUtil.internalServerError(res, {msg: 'Errors.Change_Password', words: err.message});

    return HttpUtil.success(res, 'Success.Change_Password');
  }

  async resetPassword(req, res) {
    let err, user;
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

    [err, user] = await to(this.model.getOne({_id: params.userId}, false, {}));
    if (err) {
      return HttpUtil.internalServerError(res, {msg: 'Found_Errors.user', words: err.message});
    }
    if (!user || user.delete) {
      return HttpUtil.unprocessable(res, {msg: 'Not_Exists.user', words: params.userId})
    }
    if (user.role === roles.admin && authUser.role !== roles.root) {
      return HttpUtil.forbidden(res, 'Permission_Denied');
    }

    let objUpdate = AuthUtil.setPassword(params.new_password);
    objUpdate.lastPasswordChange = Date.now();
    [err, user] = await to(this.model.updateOne(user._id, objUpdate));
    if (err) return HttpUtil.internalServerError(res, 'Errors.Reset_Password');

    return HttpUtil.success(res, 'Success.Reset_Password');
  }

  async resetDefaultPassword(req, res) {
    return this.handleAcc(req, res)
  }

  async lockAccount(req, res) {
    return this.handleAcc(req, res, {action: "lock"})
  }

  async unlockAccount(req, res) {
    return this.handleAcc(req, res, {action: "unlock", disable: false})
  }

  async handleAcc(req, res, options = {}) {
    let params = HttpUtil.checkRequiredParams2(req.params, ['userId']);
    if (params.error) return HttpUtil.badRequest(res, params.error);

    let authUser = req.authUser;
    if ([roles.root, roles.admin].indexOf(authUser.role) === -1) {
      return HttpUtil.forbidden(res, 'Permission_Denied');
    }

    let [err, user] = await to(this.model.getOne({_id: params.userId}, false, {}));
    if (err) {
      return HttpUtil.internalServerError(res, {msg: 'Found_Errors.user', words: err.message});
    }
    if (!user || user.delete) {
      return HttpUtil.unprocessable(res, {msg: 'Not_Exists.user', words: params.userId})
    }
    if (user.role === roles.admin && authUser.role !== roles.root) {
      return HttpUtil.forbidden(res, 'Permission_Denied');
    }

    let {action = "reset_pwd", disable = true} = options;
    let msg = {}, objUpdate = {disable: disable};
    if (action === "reset_pwd") {
      msg = {
        error: "Errors.Reset_Password",
        success: "Success.Reset_Password"
      };
      objUpdate = AuthUtil.setPassword(passwordDefault);
      objUpdate.lastPasswordChange = Date.now();
    }

    [err, user] = await to(this.model.updateOne(user._id, objUpdate));
    if (err) return HttpUtil.internalServerError(res, msg.error || err);

    return HttpUtil.success(res, msg.success || "Success.general");
  }
}

module.exports = new AuthController()
