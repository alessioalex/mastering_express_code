"use strict";

var express = require('express');
var app = express();

var slowestEndPoints = [];
var fastestOfTheSlowest = 0;

var getHrTime = function() {
  // ts = [seconds, nanoseconds]
  var ts = process.hrtime();
  // convert seconds to miliseconds and nanoseconds to miliseconds as well
  return (ts[0] * 1000) + (ts[1] / 1000000);
};

app.use(function(req, res, next) {
  res._startTime = getHrTime();

  var writeHead = res.writeHead;

  res.writeHead = function() {
    var min = Infinity;
    var index;
    var responseTime = getHrTime() - res._startTime;

    // we want to store the 10 slowest endpoints
    if (slowestEndPoints.length < 10) {
      slowestEndPoints.push({
        url: req.url,
        responseTime: responseTime
      });
    } else {
      if (fastestOfTheSlowest === 0) {
        fastestOfTheSlowest = Infinity;
        // this will happen only once, after the first 10 elements are inserted
        // in the array and the 11th is compared
        slowestEndPoints.forEach(function(endpoint) {
          fastestOfTheSlowest = Math.min(endpoint.responseTime, fastestOfTheSlowest);
        });
      }

      // is the response time slower than the fastest response time in the array?
      if (responseTime > fastestOfTheSlowest) {
        slowestEndPoints.forEach(function(endPoint, i) {
          if (endPoint.responseTime === fastestOfTheSlowest) {
            // remember what array item should be replaced
            index = i;
          } else {
            // searching for the next fastest response time
            min = Math.min(endPoint.responseTime, min);
          }
        });

        slowestEndPoints[index] = {
          url: req.url,
          responseTime: responseTime
        };
        fastestOfTheSlowest = min;
      }
    }

    writeHead.apply(res, arguments);
  };

  next();
});

var getRandomNrBetween = function(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
};

app.get('/slowest-endpoints', function(req, res, next) {
  // display in descending order
  res.send(slowestEndPoints.sort(function(a, b) {
    if (a.responseTime > b.responseTime) {
      return -1;
    } else if (a.responseTime < b.responseTime) {
      return 1;
    } else {
      return 0;
    }
  }));
});

app.get('*', function(req, res, next) {
  setTimeout(function() {
    res.end('ok');
  }, getRandomNrBetween(100, 1000));
});

app.listen(process.env.PORT || 7777);
