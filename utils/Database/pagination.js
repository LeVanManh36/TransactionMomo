
module.exports = {
  paginationResult(skip, limit, list_data, total, filters = {}) {
    return {
      skip: skip,
      limit: limit,
      filters: filters,
      count: list_data.length,
      list_data: list_data,
      total: total || list_data.length,
    };
  },
}
