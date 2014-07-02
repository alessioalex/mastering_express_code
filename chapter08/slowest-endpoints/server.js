"use strict";

var express = require('express');
var app = express();

var getHrTime = function() {
  // ts = [seconds, nanoseconds]
  var ts = process.hrtime();
  // convert seconds to miliseconds and nanoseconds to miliseconds as well
  return (ts[0] * 1000) + (ts[1] / 1000000);
};

var slowestEndPoints = [];
var fastestOfTheSlowest = 0;

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
          fastestOfTheSlowest = (endpoint.responseTime < fastestOfTheSlowest) ? endpoint.responseTime : fastestOfTheSlowest;
        });
      }

      // is the response time slower than the fastest response time in the array?
      if (responseTime > fastestOfTheSlowest) {
        for (var i = 0; i < slowestEndPoints.length; i++) {
          if (slowestEndPoints[i].responseTime === fastestOfTheSlowest) {
            // remember what array item should be replaced
            index = i;
          } else {
            // searching for the next fastest response time
            if (slowestEndPoints[i].responseTime < min) {
              min = slowestEndPoints[i].responseTime;
            }
          }
        }
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
  res.send(slowestEndPoints);
});

app.get('*', function(req, res, next) {
  setTimeout(function() {
    res.end('ok');
  }, getRandomNrBetween(100, 1000));
});

app.listen(process.env.PORT || 7777);
