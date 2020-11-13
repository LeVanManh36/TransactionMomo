'use strict';
/**
 * @description Schema of Card.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSchema = require('./BaseSchema');
const mTAG = 'Card';
const projection = {delete: 0, __v: 0};

const FIELDS = {
  name: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pwd: {
    type: String,
    required: true
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
