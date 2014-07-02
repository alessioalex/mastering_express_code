"use strict";

if (process.env.APP_NAME) { process.title = process.env.APP_NAME; }

var http = require('http');
var express = require('express');
var app = express();
var ENV = process.env.NODE_ENV || 'development';
var cuid = require('cuid');
var VError = require('verror');
var enableDestroy = require('server-destroy');

var getHrTime = require('./lib/getHrTime');
var logger = require('./lib/logger').createLogger({
  appName: 'logging-sample-app',
  logFile: __dirname + '/logs/' + ENV + '.log',
  level: 'info'
});

// assign a unique ID for this request so we can later filter everything
// related to it if necessary
app.use(function(req, res, next) {
  req.reqId = cuid();
  next();
});

// log the request information and the response begin && end time
app.use(function(req, res, next) {
  var startTime = getHrTime();

  logger.info({ req: req }, 'request-data');

  var writeHead = res.writeHead;
  res.writeHead = function() {
    res._responseTime = getHrTime() - startTime;
    writeHead.apply(res, arguments);
  };

  // log the finished requests
  res.once('finish', function() {
    var responseTotalTime = getHrTime() - startTime;

    logger.info({
      res: res,
      reqId: req.reqId,
      responseTime: res._responseTime,
      responseTotalTime: responseTotalTime
    }, 'response-data');
  });

  next();
});

app.get('/', function(req, res, next) {
  res.send('Hello World');
});

var queryDb = function(cb) {
  setImmediate(function() {
    cb(new Error('Data unavailable'));
  });
};

app.get('/error', function(req, res, next) {
  queryDb(function(err) {
    if (err) {
      // provide a richer error object using VError
      // bunyan will know how to handle the full error stack
      var err2 = new VError(err, 'GET /error route handler - queryDb');
      return next(err2);
    } else {
      res.send('ok');
    }
  });
});

app.get('/uncaught', function(req, res, next) {
  setTimeout(function() {
    throw new Error('something bad happened');
  }, 2000);

  setInterval(function() {
    res.write(new Date().toString());
  }, 200);
});

app.use(function(err, req, res, next) {
  logger.error({
    err: err,
    reqId: req.reqId
  }, 'middleware:errorHandler');

  res.status(500).send('500 - Internal Server Error');
});

process.once('uncaughtException', function(err) {
  // log the error to `process.stderr` just this once
  console.error(err.stack);

  // close the server, kill all connections
  server.destroy();

  logger.fatal({ err: err }, 'uncaughtException');
  // ignore future possible uncaught exceptions since we are closing the server
  // and exiting the process as soon as possible
  process.on('uncaughtException', function() {});

  // give the logger some time to write the error to the file
  // and then exit the process
  setTimeout(function() {
    process.exit(1);
  }, 2000);
});

var server = http.createServer(app).listen(process.env.PORT || 7777);
enableDestroy(server);
