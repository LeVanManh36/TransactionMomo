const {rootPath, externalServices} = require('../config');

module.exports = {
  rootPath: rootPath,
  ...externalServices.digital
}
