"use strict";

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var Err = require('custom-err');
var csrf = require('csurf');
var ejs = require('secure-filters').configure(require('ejs'));
var csrfHelper = require('./lib/middleware/csrf-helper');

var homeRouter = require('./routes/index');
var filesRouter = require('./routes/files');

var config = require('./config.json');
var app = express();
var ENV = app.get('env');

// view engine setup
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(favicon());
// if (ENV === 'development') {
//   app.use(logger('dev'));
// }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// Limit uploads to X Mb
app.use(multiparty({
  maxFilesSize: 1024 * 1024 * config.maxSize
}));
app.use(cookieParser());
app.use(session({
  keys: ['rQo2#0s!qkE', 'Q.ZpeR49@9!szAe']
}));
app.use(csrf());
// add CSRF helper
app.use(csrfHelper);

app.use('/', homeRouter);
app.use('/files', filesRouter);

app.use(express.static(path.join(__dirname, 'public')));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(Err('Not Found', { status: 404 }));
});

/// error handlers

// development error handler
// will print stacktrace
if (ENV === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
