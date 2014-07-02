"use strict";

var mongoose = require('mongoose');

exports.isValidationError = function(err) {
  return ((err.name === 'ValidationError')
          || (err.message.indexOf('ValidationError') !== -1));
};

exports.isDuplicateKeyError = function(err) {
  return (err.message.indexOf('duplicate key') !== -1);
};

exports.connect = function(url, cb) {
  cb = cb || function(err) {
    if (err) {
      console.error('database connection failure: \n' + err.stack);
      process.exit(1);
    }
  };

  var callback = function(err) {
    if (err && !/trying to open unclosed connection/i.test(err.message)) {
      return cb(err);
    }

    return cb();
  };

  mongoose.connect(url, { safe: true }, callback);
};
