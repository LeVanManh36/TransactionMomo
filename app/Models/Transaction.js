'use strict';
/**
 * @description Schema of Transaction.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSchema = require('./BaseSchema');
const mTAG = 'Transaction';
const projection = {delete: 0, __v: 0};

const FIELDS = {
  amount: {
    type: Number,
    default: 0,
    index: true
  },
  customer: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  paymentDate: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    index: true
  },
  momoTransId: {
    type: String,
    required: true,
    index: true
  },
  card: {
    type: Schema.ObjectId,
    ref: 'Card',
    index: true
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
const arrayJoin = [
  {path: 'card', select: 'name email phone'},
];

let tableSchema = BaseSchema(FIELDS, projection, null, arrayJoin);

module.exports = mongoose.model(mTAG, tableSchema);
