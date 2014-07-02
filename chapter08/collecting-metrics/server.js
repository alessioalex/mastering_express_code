"use strict";

var fs = require('fs');
var os = require('os');
var usage = require('usage');
var metrics = require('measured');
var httpCollection = new metrics.Collection('http');
var processCollection = new metrics.Collection('process');
var osCollection = new metrics.Collection('os');
var express = require('express');
var app = express();
var SAMPLE_INTERVAL = 15000;

var hostname = os.hostname();
var pid = process.pid;

// HTTP metrics
var rps = httpCollection.meter('requestsPerSecond');
var responseTime = httpCollection.timer('responseTime');
// ------------

// Process metrics
var memoryUsage = processCollection.gauge('memory-usage', function() {
  return process.memoryUsage();
});
var processUptime = processCollection.gauge('uptime', function() {
  return process.uptime();
});
var _cpuUsage = 0;
var processCpuUsage = processCollection.gauge('cpu-usage', function() {
  return _cpuUsage;
});
var getCpuUsage = function() {
  usage.lookup(process.pid, { keepHistory: true }, function(err, result) {
    if (!err) {
      _cpuUsage = result.cpu;
    }
  });
};
setInterval(getCpuUsage, SAMPLE_INTERVAL - 1000);

var delay = processCollection.timer('eventLoopDelay');
var getEventLoopDelay = function() {
  var stopwatch = delay.start();
  setImmediate(function() {
    stopwatch.end();
  });
};
setInterval(getEventLoopDelay, SAMPLE_INTERVAL - 1000);
// ------------

// OS metrics
var osUptime = osCollection.gauge('uptime', function() {
  return os.uptime();
});
var osMemory = osCollection.gauge('memory', function() {
  return {
    total: os.totalmem(),
    free: os.freemem()
  };
});
var osLoad = osCollection.gauge('load-average', function() {
  return os.loadavg();
});
// ------------

app.use(function(req, res, next) {
  // measuring response time
  var stopwatch = responseTime.start();

  // measuring requests per second
  rps.mark();

  var writeHead = res.writeHead;

  res.writeHead = function() {
    writeHead.apply(res, arguments);
    stopwatch.end();
  };

  next();
});

app.use('/public', express.static(__dirname + '/public'));

// NOTE: we should have some sort of authentication mechanism when using this
// into production, like HTTP auth or using a token
app.get('/metrics', function(req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': '*'
  });
  res.json({
    hostname: hostname,
    pid: pid,
    http: httpCollection.toJSON().http,
    process: processCollection.toJSON().process,
    os: osCollection.toJSON().os
  });
  // NOTE: you may want to reset the metrics here after they are sent
});

app.get('/', function(req, res, next) {
  fs.createReadStream(__filename).pipe(res);
});

app.get('/long', function(req, res, next) {
  setTimeout(function() {
    res.end('ok');
  }, 1000);
});

app.listen(process.env.PORT || 7777);
