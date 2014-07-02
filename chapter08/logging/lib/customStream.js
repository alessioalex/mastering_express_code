"use strict";

// Streams2 Writable when available (Node > 0.10.x)
// or falling back to using a polyfill
var util = require('util');
var stream = require('stream');
var Writable = stream.Writable || require('readable-stream').Writable;
var request = require('request');

function LogStream(options) {
  options = options || {};

  this._url = options.url;
  this._attemptInterval = 1000;
  this._maxAttempts = 3;

  Writable.call(this, options);
}
util.inherits(LogStream, Writable);

LogStream.prototype._write = function(chunk, enc, cb) {
  this._sendLog(chunk, 1, cb);
};

LogStream.prototype._sendLog = function(data, attempt, cb) {
  var _this = this;

  if (attempt > this._maxAttempts) {
    // silently ignore and loose the data, not the best option though
    return cb();
  }

  request({
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: data,
    url: this._url
  }, function(err, res, body) {
    if (err || (res.statusCode !== 200 && res.statusCode !== 201)) {
      setTimeout(function() {
        attempt++;
        _this._sendLog(data, attempt, cb);
      }, _this._attemptInterval);
    } else {
      cb();
    }
  });
};

module.exports = LogStream;
