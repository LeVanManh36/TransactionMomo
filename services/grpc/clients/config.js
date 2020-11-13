const {rootPath, externalServices} = require('../config');
const {auth, file} = externalServices;

module.exports = {
  rootPath: rootPath,
  externalServices: {
    auth,
    file
  }
}
