'use strict';

const mongoose = require('mongoose');
const to = require('await-to-js').default;
const Utils = require('../../utils');

const {NODE_ENV = 'production', DB_LOCALE = 'vi'} = process.env
const schemaOptions = {
  autoIndex: NODE_ENV !== 'production',
  collation: {
    locale: DB_LOCALE,
    numericOrdering: true,
    strength: 1
  },
  toJSON: {virtuals: true},
  id: false
}

module.exports = (fields, projection = {}, methods = null, joins = []) => {
  let baseSchema = new mongoose.Schema(fields, schemaOptions);

  if (methods) baseSchema.methods = methods;

  baseSchema.statics = {

    getRelationShip() {
      return joins.map(item => item.path)
    },

    /**
     * Find user by id
     * @param {ObjectId} id
     * @api private
     */

    async load(id) {
      let query = this.findOne({_id: id}, projection);
      if (joins.length) {
        joins.map(item => {
          query.populate(item)
        })
      }
      return await query
    },

    loadCb(id, cb) {
      let query = this.findOne({_id: id}, projection);
      if (joins.length) {
        joins.map(item => {
          query.populate(item)
        })
      }
      return query.exec(cb)
      // return this.findOne({_id: id}).exec(cb);
    },

    async findByCondition(condition, lookup = false, project = projection) {
      let query = this.find(condition, project);
      if (lookup && joins.length) {
        joins.map(item => {
          query.populate(item)
        })
      }
      return await query
    },

    async getOne(condition, lookup = false, project = projection, options = {}) {
      let query = this.findOne(condition, project, options);
      if (lookup && joins.length) {
        joins.map(item => {
          query.populate(item)
        })
      }
      let [err, result] = await to(query);
      if (err) throw Error(err.message);
      return result ? Utils.cloneObject(result) : result
    },

    async getIdsByCondition(condition) {
      let [err, lists] = await to(this.findByCondition(condition));
      if (err) throw Error(err.message);
      return lists.length ? lists.map(item => item._id) : []
    },

    /**
     * get list
     * @param {Object} options
     * @param {Object} selection
     * @api private
     */

    async lists(options, selection = null) {
      if (!selection) selection = projection;
      let sorts = options.sorts || {'insert.when': -1};
      let filters = options.filters || {};
      if (!filters.delete) filters.delete = {$exists: false};

      let query = this.find(filters);
      if (joins.length) {
        joins.map(item => query.populate(item))
      }

      if (options.perPage === -1) { // get all data
        return await query
          .select(selection)
          .sort(sorts) // default sort by createdAt
      }

      return await query
        .select(selection)
        .sort(sorts) // default sort by createdAt
        .limit(options.perPage)
        .skip(options.perPage * options.page)
    },

    async getCount(condition) {
      condition = condition || {};
      if (!condition.delete) condition.delete = {$exists: false};
      return await this.count(condition) // version mongoose 4.7.2
      // return await this.countDocuments(condition) // version mongoose 5.8.3
    },

    async insertOne(obj, authUser = null) {
      obj.insert = {
        when: Date.now(),
        by: authUser ? authUser._id : undefined
      }
      return await this.create(obj)
    },

    async updateByCondition(condition, dataSet, dataUnset = {}, multi = false) {
      let data = Object.keys(dataSet).length !=0 ? {$set: dataSet} : {};
      if (dataUnset && Object.keys(dataUnset).length) data = {...data, $unset: dataUnset};
      return await this.update(condition, data, {'multi': multi})
    },

    async updateOne(_id, data, dataUnset = {}, authUser = null) {
      data.update = {
        when: Date.now(),
        by: authUser ? authUser._id : undefined
      }
      return await this.updateByCondition({_id: _id}, data, dataUnset)
    },

    async updateManyByCondition(condition, data, dataUnset = {}, authUser = null) {
      data.update = {
        when: Date.now(),
        by: authUser ? authUser._id : undefined
      }
      return await this.updateByCondition(condition, data, dataUnset, true)
    },

    async deleteByCondition(condition) {
      return await this.remove(condition) // version mongoose 4.7.2
      // return await this.deleteOne(condition) // version mongoose 5.8.3
    },

    async delete(_id) {
      return await this.deleteByCondition({_id: _id})
    },

    async softDeletes(condition, authUser = null, multi = false) {
      let data = {
        when: Date.now(),
        by: authUser ? authUser._id : undefined
      };
      return await this.updateByCondition(condition, {delete: data}, multi)
    }
  }

  return baseSchema;
}
