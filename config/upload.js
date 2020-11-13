'use strict'

const Utils = require('../utils');
const {UPLOAD_HOST, UPLOAD_PORT, UPLOAD_DIR, MEDIA_DIR, INSTALLATION} = require('./env/upload');

let uploadHost = Utils.formatUrl(UPLOAD_HOST);
if (UPLOAD_PORT !== '80') uploadHost = `${uploadHost}:${UPLOAD_PORT}`;

module.exports = {
  uploadHost: uploadHost,
  uploadDir: UPLOAD_DIR,
  downloadDir: `${UPLOAD_DIR}/${INSTALLATION}`,
  assetDir: `${MEDIA_DIR}/${INSTALLATION}`,
  mediaDir: MEDIA_DIR,
  installation: INSTALLATION
}
