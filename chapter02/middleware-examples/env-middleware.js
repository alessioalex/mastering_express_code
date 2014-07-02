"use strict";

var express = require('express');
var app = express();

var configureByEnvironment = function(env) {
  if (!env) { env = process.env.NODE_ENV; }

  // default to development
  env = env || 'development';

  return function(env2, callback) {
    if (env === env2) { callback(); }
  };
};

configure = configureByEnvironment();

configure('development', function() {
  app.use(express.logger('dev'));
  app.use(express.responseTime());
  app.use(express.static(__dirname + '/public'));
});
configure('production', function() {
  app.use(express.logger());
  // enable gzip compression for static resources in production
  app.use(express.compress());
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res, next) {
  res.send('Hello world');
});
app.get('/error', function(req, res, next) {
  next(new Error('manually triggered error'));
});

configure('development', function() {
  app.use(express.errorHandler());
});
configure('production', function() {
  app.use(function customErrorHandler(err, req, res, next) {
    res.status(500).send('500 - Internal Server Error');
    console.error(err.stack);
  });
});

console.log(app.stack);

app.listen(7777);
console.log('application environment: %s', process.env.NODE_ENV || 'development');
