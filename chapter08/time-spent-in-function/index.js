"use strict";

var getRandomNrBetween = function(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
};

var getHrTime = function() {
  // ts = [seconds, nanoseconds]
  var ts = process.hrtime();
  // convert seconds to miliseconds and nanoseconds to miliseconds as well
  return (ts[0] * 1000) + (ts[1] / 1000000);
};

var wrapAsyncFn = function(func, callback) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var startTime = getHrTime();

    // last argument should be the function callback
    var funcCallback = args.pop();

    // put our own wrapper instead of the original function callback
    args.push(function() {
      var endTime = getHrTime();
      funcCallback.apply(this, arguments);
      callback(endTime - startTime);
    });

    func.apply(null, args);
  };
};

var wrapSyncFn = function(func, callback) {
  return function() {
    var startTime = getHrTime();
    func.apply(null, arguments);
    var endTime = getHrTime();
    callback(endTime - startTime);
  };
};

var printTime = function(fnName, time) {
  console.log('%s took %s milliseconds to return', fnName, time);
};

var queryDbSampleFn = function(userId, cb) {
  return setTimeout(function() {
    cb(null, { user: 'John', fullname: 'John Doe' });
  }, getRandomNrBetween(300, 1000));
};

queryDbSampleFn = wrapAsyncFn(queryDbSampleFn, printTime.bind(null, 'queryDbSampleFn'));
queryDbSampleFn(32, function(err, data) {});

var calculateSum = function(lastNr) {
  var sum = 0;

  for (var i = 0; i <= lastNr; i++) {
    sum += i;
  }

  return sum;
};

calculateSum = wrapSyncFn(calculateSum, printTime.bind(null, 'calculateSum'));
calculateSum(9000000);
