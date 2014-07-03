"use strict";

var express = require('express');
var logger = require('morgan');
var compress = require('compression');
var responseTime = require('response-time');
var errorHandler = require('errorhandler');
var app = express();

var configureByEnvironment = function(env) {
  if (!env) { env = process.env.NODE_ENV; }

  // default to development
  env = env || 'development';

  return function(env2, callback) {
    if (env === env2) { callback(); }
  };
};

var configure = configureByEnvironment();

configure('development', function() {
  app.use(logger('dev'));
  app.use(responseTime());
  app.use(express.static(__dirname + '/public'));
});
configure('production', function() {
  app.use(logger());
  // enable gzip compression for static resources in production
  app.use(compress());
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res, next) {
  res.send('Hello world');
});
app.get('/error', function(req, res, next) {
  next(new Error('manually triggered error'));
});

configure('development', function() {
  app.use(errorHandler());
});
configure('production', function() {
  app.use(function customErrorHandler(err, req, res, next) {
    res.status(500).send('500 - Internal Server Error');
    console.error(err.stack);
  });
});

app.listen(7777);
console.log('server listening on port 7777');
console.log('application environment: %s', process.env.NODE_ENV || 'development');
