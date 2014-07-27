"use strict";

var http = require('http');
var express = require('express');
var app = express();

var os = require('os');
var hostname = os.hostname();

var addStatusEndpoint = function(key, server) {
  return function(req, res, next) {
    if (!req.query.key || req.query.key !== key) {
      res.status(401).send('401 - Unauthorized');
    } else {
      server.getConnections(function(err, count) {
        if (err) {
          return res.status(500).send('Error getting connections' + err.message);
        }

        res.send({
          hostname: hostname,
          pid: process.pid,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          activeConnections: count
        });
      });
    }
  }
};

var server = http.createServer(app).listen(process.env.PORT || 7777);

app.get('/app-status', addStatusEndpoint('long_secret_key', server));

// sample response:
/*
{
  hostname: "MBP.local",
  pid: 39673,
  uptime: 93,
  memoryUsage: {
    rss: 21397504,
    heapTotal: 16571136,
    heapUsed: 6632784
  },
  activeConnections: 2
}
*/
