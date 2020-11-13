'use strict'

const async = require('async');
const fs = require('fs');
const {licenseDir} = require('../../config');

function __exec36() {
  async.series(
    [
      (cb) => {
        let exists = fs.existsSync(licenseDir);
        if (exists) return cb();

        fs.mkdir(licenseDir, '0777', (err) => {
          if (!err) return cb();
          console.log('*****************************************************');
          console.log('*        Unable to create licenses directory        *');
          console.log('*****************************************************\n');
          process.exit(1);
        })
      }
    ],
    (err) => {
      if (err) console.log('*** checkFolderData error:', err)
    }
  )
}
__exec36();
