'use strict';
/**
 * @description Schema of User model.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSchema = require('./BaseSchema');
const {roles} = require('../../config');
const Utils = require('../../utils');
const mTAG = 'User'
const projection = {delete: 0, __v: 0, hash: 0, salt: 0};

const FIELDS = {
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    default: roles.maker,
    index: true
  },
  address: {
    type: String,
    required: false,
    index: true
  },
  phone: {
    type: String,
    index: true
  },
  company: {
    type: Schema.ObjectId,
    ref: 'Company',
    index: true
  },
  hash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  disable: {
    type: Boolean,
    default: false
  },
  lastPasswordChange: {
    type: String,
    default: Date.now
  },
  insert: {
    when: {type: Date, default: Date.now}
  },
  update: {
    when: {type: Date}
  },
  delete: {
    when: {type: Date}
  }
}

const allowField = ['_id', 'email', 'name', 'role', 'phone', 'company', 'insert', 'update'];
const methods = {
  getFields: function (fields = allowField) {
    return Utils.fillOptionalFields(this, {}, fields);
  }
};

const arrayJoin = [
  {path: 'company', select: 'name address email phone storageConfig enableLog enableTracking'},
];

let tableSchema = BaseSchema(FIELDS, projection, methods, arrayJoin);

module.exports = mongoose.model(mTAG, tableSchema);
