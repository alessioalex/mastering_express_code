"use strict";

var express = require('express');
var app = express();

var leaks = [];
function Leak() {};

var heapdump = require('heapdump');
var memoryThreshold = 50;

setInterval(function () {
  // get RSS in bytes and transform into megabytes
  var memoryUsage = process.memoryUsage().rss / 1024 / 1024;

  if (memoryUsage > memoryThreshold) {
    // write to disk
    heapdump.writeSnapshot();
    // increase memory threshold
    memoryThreshold += 100;
  }
}, 60000);

app.use(function(req, res, next) {
  for (var i = 0; i < 1000; i++) {
    leaks.push(new Leak());
  }

  res.send('Memory usage: ' + (process.memoryUsage().rss / 1024 / 1024));
});

app.listen(process.env.PORT || 7777);
