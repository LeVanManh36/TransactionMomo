// ************************************************** //
// ******************** load env ******************** //
require('../../config/env');
// require('./__x25');
// ************************************************** //
const {mongodb, backendPort} = require('../../config');
// ************************************************** //
const express = require('express');
const mongoose = require('mongoose');
// ************************************************** //
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// ************************************************** //
// **************** connect mongodb ***************** //
mongoose.Promise = global.Promise;
mongoose.connect(mongodb.dbConnectURI, mongodb.options);

mongoose.connection.on('error', function (e) {
  console.log('********************************************');
  console.log('*          MongoDB Process not running     *');
  console.log('********************************************\n');
  console.log(e);
  process.exit(1);
});

// ********************************************************************************* //
// ******************************* system check process **************************** //
require('./__x36');
// if (process.platform !== 'win32') {
//   require('./__x30')
// }
// ********************************************************************************* //
// *********************************** load models ********************************* //
require('../Models').load();
// ********************************************************************************* //
// ************************************ init app *********************************** //
let app = express();
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  cookie: {},
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));
// ********************************** config app *********************************** //
require('./modules/Express')(app);
// ********************************** init server ********************************** //
let server = require('http').createServer(app);
// ********************************** reset server ********************************* //
require('../../app/Databases/initdb');
// ********************************* handle server ********************************* //
server.listen(backendPort, () => {
  console.log('Server listening on port', backendPort);
});
// ************************************************** //
server.on('error', (err) => {
  throw Error(err.message)
});
// ************************************************** //
// server.on('connection', (socket) => {
//   // 60 minutes timeout
//   socket.setTimeout(3600000);
// });
// ************************************************** //
// *************** init schedule job **************** //
require('../../app/Cronjob').start();
// ************************************************** //
// *********************** End ********************** //
module.exports = app;
