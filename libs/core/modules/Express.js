'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const express = require('express');
const fs = require('fs');
const favicon = require('serve-favicon');
// const logger = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
// const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const contentDisposition = require('content-disposition');
const config = require('../../../config');

module.exports = (app) => {

  if (process.env.NODE_ENV === 'dev') {
    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });
    app.use(errorHandler());
    app.locals.pretty = true;
    app.locals.compileDebug = true;
  } else {
    app.use(favicon(path.join(config.rootPath, 'public/images/favicon.ico')));
  }
  // error handler
  // define as the last app.use callback
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
  });

  // Set header to force download
  function setContentDisposition(res, path) {
    let filename = res.req.query.filename || null;
    if (filename) {
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    } else {
      res.setHeader('Content-Disposition', contentDisposition(path))
    }
  }

  app.use('/downloads', express.static(config.downloadDir));
  app.use('/licenses', express.static(config.licenseDir));
  app.use('/media', express.static(config.assetDir));
  app.use('/files', serveStatic(config.assetDir, {'index': false, 'setHeaders': setContentDisposition}));

  app.use(express.static(path.join(config.rootPath, 'public')));
  app.set('view engine', 'jade');
  app.locals.basedir = config.viewDir;
  app.set('views', config.viewDir);
  //app.use(logger('dev'));
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(bodyParser.urlencoded({extended: true}));
  // app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));
  app.use(methodOverride());
  app.use(cookieParser());

  // Load routes
  require('../../../routes')(app);

  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401);
      res.json({"message": err.name + ": " + err.message});
    }
  });

  // custom error handler
  app.use((err, req, res, next) => {
    if (err.message.indexOf('not found') >= 0) return next();

    //ignore range error as well
    if (err.message.indexOf('Range Not Satisfiable') >= 0) return res.send();

    console.error(err.stack)
    res.status(500).render('500')
  })

  app.use((req, res, next) => {
    //res.redirect('/');
    res.status(404).render('404', {url: req.originalUrl})
  })
};
