"use strict";

var bunyan = require('bunyan');
var logger;

var serializers = {};

serializers.req = function(req) {
  return {
    reqId: req.reqId,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    ip: req.ip
  };
};

exports.serializers = serializers;

exports.createLogger = function(opts) {
  opts = opts || {};

  // var LogStream = require('./customStream');
  // var logStream = new LogStream({ url: 'http://site.tld/appName/logs?key=SECRET' });

  if (!logger) {
    logger = bunyan.createLogger({
      name: opts.appName,
      serializers: {
        req: serializers.req,
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
      },
      streams: [{
        type: 'rotating-file',
        path: opts.logFile,
        period: '1d',   // daily rotation
        count: 3,       // keep 3 back copies
        level: opts.level || 'info'
      }]
      // streams: [{
      //   stream: logStream,
      //   level: opts.level || 'info'
      // }]
    });
  }

  return logger;
};
