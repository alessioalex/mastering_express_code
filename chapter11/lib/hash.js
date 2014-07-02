"use strict";

var bcrypt = require('bcrypt');
var errTo = require('errto');

var Hash = {};

Hash.generate = function(password, cb) {
  bcrypt.genSalt(10, errTo(cb, function(salt) {
    bcrypt.hash(password, salt, errTo(cb, function(hash) {
      cb(null, hash);
    }));
  }));
};

Hash.compare = function(password, hash, cb) {
  bcrypt.compare(password, hash, cb);
};

module.exports = Hash;
