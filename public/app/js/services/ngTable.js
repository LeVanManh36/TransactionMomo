'use strict';

angular.module('pisignage.services')
  .factory('piNgTable', function (NgTableParams) {

    return {

      arrFieldDate: ['insert.when', 'delete.when', 'registration.date', 'registration.expired'],
      arrFieldBoolean: [],
      arrFieldIncludes: [],
      arrFieldStatus: ['status'],

      setConditions(params) {
        return {
          currentPage: params.page() - 1,
          pageSize: params.count(),
          'filters[]': this.setFilter(params.filter()),
          'sorting[]': this.setSorts(params.orderBy())
        }
      },

      setFilter(filters = {}) {
        let conditions = []
        for (let [columnName, value] of Object.entries(filters)) {
          if (!value && value !== 0) continue;

          let dataType = "text";
          let operation = "contains"
          if (this.arrFieldDate.includes(columnName)) {
            dataType = "date";
            value = {"key": "dateRange", "startDate": value, "endDate": value}
            operation = "daterange"
          } else if (this.arrFieldBoolean.includes(columnName)) {
            operation = "equal"
            dataType = "boolean"
            value = value === 'true'
          } else if (this.arrFieldIncludes.includes(columnName)) {
            operation = "equal"
            dataType = "arrayValue"
          } else if (this.arrFieldStatus.includes(columnName)) {
            operation = "equal"
            dataType = "number"
          }
          conditions.push({columnName, value, operation, dataType})
        }
        return conditions
      },

      setSorts(sorts = []) {
        return sorts.map(condition => ({
          columnName: condition.slice(1),
          direction: condition[0] === '-' ? 'desc' : 'asc'
        }))
      },

      default: {
        option: {page: 1, count: 10},
        counts: [10, 25, 50, 100]
      },

      init(fetchData, option, counts) {
        return new NgTableParams(
          {...option},
          {
            counts: counts,
            total: 0,
            getData: (params => fetchData(params))
          }
        )
      }
    }
  });
