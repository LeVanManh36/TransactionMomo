'use strict';
/**
 * @description Schema of Company.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSchema = require('./BaseSchema');
const mTAG = 'Company';
const projection = {delete: 0, __v: 0};

const FIELDS = {
  name: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: false,
    index: true
  },
  address: {
    type: String,
    required: true,
    index: true
  },
  description: {type: String},
  /*
    * cấu hình không gian lưu trữ
    * capacity: dung lượng upload assets: 1000MB
    * free: không gian trống
   */
  storageConfig: {
    capacity: {type: Number, default: 1000},
    free: {type: Number}
  },
  enableLog: {
    type: Boolean,
    default: false
  },
  enableTracking: {
    type: Boolean,
    default: false
  },
  // times
  insert: {
    when: {type: Date, default: Date.now},
    by: {type: Schema.ObjectId, ref: 'User'}
  },
  update: {
    when: {type: Date},
    by: {type: Schema.ObjectId, ref: 'User'}
  },
  delete: {
    when: {type: Date},
    by: {type: Schema.ObjectId, ref: 'User'}
  }
};

let tableSchema = BaseSchema(FIELDS, projection);

module.exports = mongoose.model(mTAG, tableSchema);
