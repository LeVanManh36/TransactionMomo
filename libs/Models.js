'use strict'

const fs = require('fs');
const rootPath = process.cwd();
const modelsPath = `${rootPath}/app/Models`;

module.exports = {
  load() {
    require('../app/Models/User');
    // require('../app/Models/Area');
  },

  init() {
    fs.readdirSync(modelsPath).forEach(file => {
      if (!file.includes('BaseSchema') && !file.includes('template')) {
        require(modelsPath + '/' + file);
      }
    });

    console.log('********************************************************************');
    console.log('**************************    Load models    ***********************');
    console.log('********************************************************************\n');
  }
}
