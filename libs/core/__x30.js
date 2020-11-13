'use strict'

const async = require('async');
const fs = require('fs');
// const fse = require('fs-extra');
// const exec = require('child_process').exec;

const {mediaDir, assetDir, uploadDir, downloadDir} = require('../../config');

function __execD() {
  let errors = 0;
  async.series(
    [
      (cb) => {
        let exists = fs.existsSync(mediaDir);
        if (exists) return cb();

        fs.mkdir(mediaDir, '0777', (err) => {
          if (!err) return cb();
          console.log('*****************************************************');
          console.log('*         Unable to create media directory          *');
          console.log('*****************************************************\n');
          process.exit(1);
        })
      },
      (cb) => {
        let exists = fs.existsSync(assetDir);
        if (exists) return cb();

        fs.mkdir(assetDir, '0777', (err) => {
          if (!err) return cb();
          console.log('*****************************************************');
          console.log('*         Unable to create asset directory          *');
          console.log('*****************************************************\n');
          process.exit(1);
        })
      },
      (cb) => {
        let exists = fs.existsSync(uploadDir);
        if (exists) return cb();

        fs.mkdir(uploadDir, '0777', (err) => {
          if (!err) return cb();
          console.log('*****************************************************');
          console.log('*        Unable to create upload directory          *');
          console.log('*****************************************************\n');
          process.exit(1);
        })
      },
      (cb) => {
        let exists = fs.existsSync(downloadDir);
        if (exists) return cb();

        fs.mkdir(downloadDir, '0777', (err) => {
          if (!err) return cb();
          console.log('*****************************************************');
          console.log('*       Unable to create download directory         *');
          console.log('*****************************************************\n');
          process.exit(1);
        })
      },
      // (cb) => {
      //   exec('ffprobe -version', (err, stdout, stderr) => {
      //     if (!err) return cb();
      //     console.log('***********************************************************************');
      //     console.log('*     Please install ffmpeg, videos cannot be uploaded otherwise      *');
      //     console.log('***********************************************************************\n');
      //     console.log(err)
      //     errors++;
      //   })
      // },
      // (cb) => {
      //   exec('convert -version', (err, stdout, stderr) => {
      //     if (err) {
      //       console.log('*********************************************************************');
      //       console.log('* Please install imagemagik, otherwise thumbnails cannot be created *');
      //       console.log('*********************************************************************\n');
      //       console.log(err)
      //       errors++;
      //     }
      //     cb();
      //   })
      // }
    ],
    (err) => {
      if (errors) console.log('*****  system check complete with ' + errors + ' errors  *****');
    }
  )
}
__execD();
