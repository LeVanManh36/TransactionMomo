'use strict';
/**
 * @description Schema of Model.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSchema = require('./BaseSchema');
const mTAG = 'ooh_positions';
const projection = {delete: 0, __v: 0};

const FIELDS = {
  address: {type: String, required: true, index: true},
  size: {type: String, required: true, index: true},
  description: String,
  light: String,
  vision: String,
  flow: String,
  area: {
    type: Schema.ObjectId,
    ref: "Area",
    index: true,
    required: true
  },
  lng: {
    type: String,
    default: "105.8412"
  },
  lat: {
    type: String,
    default: "21.0245"
  },
  link: {
    type: String,
    default: ''
  },
  packages: {
    name: {type: String, default: "Common.aMonth"},
    price: {type: String, default: "1000000"}
  }, // gói trình chiếu
  discount: {
    value: {type: String},
    startDate: {type: String},
    endDate: {type: String},
    default: {type: String, default: 0}
  }, // triết khấu %
  calendars: [], // lịch đặt của khách hàng
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
  {path: 'area', select: 'name lng lat'}
];

let oohPositionSchema = BaseSchema(FIELDS, projection, null, arrayJoin);

module.exports = mongoose.model(mTAG, oohPositionSchema);

// let calendar = {
//   startDate: {type: String},
//   endDate: {type: String},
//   contract: {type: Schema.ObjectId}
// }
