"use strict";

var mongoose = require('mongoose');

exports.isValidationError = function(err) {
  return (err && err.message && /ValidationError/.test(err.message));
};

exports.isDuplicateKeyError = function(err) {
  return (err && err.message && /duplicate key/.test(err.message));
};

exports.connect = function(url, cb) {
  cb = cb || function(err) {
    if (err) {
      console.error('database connection failure: \n' + err.stack);
      process.exit(1);
    }
  };

  mongoose.connect(url, { safe: true }, cb);
};
