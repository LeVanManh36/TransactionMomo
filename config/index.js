'use strict'

const rootPath = process.cwd();
const configDir = `${rootPath}/config`;
const viewDir = `${rootPath}/views`;
const dataDir = `${rootPath}/data`;
const {uploadDir, uploadHost, assetDir, downloadDir, mediaDir, installation} = require('./upload');
const licenseDir = `${dataDir}/licenses`;

const {FORMAT_DATE = 'YYYY-MM-DD'} = process.env;
const {baseUrl, backendHost, backendPort} = require('./http');
const DB_CONFIG = require('./database');
const downloadUrl = `${baseUrl}/downloads`;
// const pdfMakeFonts = require('../libs/pdfmake/fonts.json');
const {EXCEL_LINE_LIMIT} = process.env;
const settings = require('./setting');

module.exports = {
  baseUrl: baseUrl,
  backendHost: backendHost,
  backendPort: backendPort,
  rootPath: rootPath,
  configDir: configDir,
  viewDir: viewDir,
  formatDate: FORMAT_DATE,
  // config for project
  dataDir: dataDir,
  mediaDir: mediaDir,
  assetDir: assetDir,
  downloadDir: downloadDir,
  downloadUrl: downloadUrl,
  licenseDir: licenseDir,
  installation: installation,
  uploadDir: uploadDir,
  uploadHost: uploadHost,
  // config database
  mongodb: DB_CONFIG,
  session: {
    secret: 'manhlv2512@gmail.com'
  },
  ...settings,
  // pdfMakeFonts: pdfMakeFonts,
  conversionValue: 1000,
  EXCEL_LINE_LIMIT: EXCEL_LINE_LIMIT || 20000
};
