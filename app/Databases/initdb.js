'use strict'

const Utils = require('../../utils/auth');
const Model = require('../Models/User');
const {roles} = require('../../config');

function __x11() {
  __x23({
    email: "root",
    name: "Administrator",
    role: roles.root
  }, "root@123456!@#")
  __x23({
    email: "admin",
    name: "Hành chính nhân sự",
    role: roles.admin
  }, "123456!@#")
}

function __x23(obj, hash) {
  Model.findOne({email: obj.email}, (err, data) => {
    if (!err && !data) {
      obj = {...obj, ...Utils['setPassword'](hash)};
      Model.create(obj, (err) => {
        if (err) console.log('func__x23 exec error:', err);
      })
    }
  })
}
__x11();
