"use strict";

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var cuid = require('cuid');
var errTo = require('errto');
var Err = require('custom-err');
var hash = require('../lib/hash');
var pkg = require('../package.json');
var config = require('../config.json');
var debug = require('debug')(pkg.name + ':fileModel');

function File(options, id) {
  this.id = id || cuid();
  this.meta = _.pick(options, ['name', 'type', 'size', 'hash', 'uploadedAt']);
  this.meta.uploadedAt = this.meta.uploadedAt || new Date();
}

File.prototype.save = function(path, password, cb) {
  var _this = this;

  this.move(path, errTo(cb, function() {
    if (!password) { return _this.saveMeta(cb); }

    hash.generate(password, errTo(cb, function(hashedPassword) {
      _this.meta.hash = hashedPassword;

      _this.saveMeta(cb);
    }));
  }));
};

File.prototype.move = function(path, cb) {
  fs.rename(path, this.path, cb);
};

File.prototype.saveMeta = function(cb) {
  fs.writeFile(this.path + '.json', JSON.stringify(this.meta), cb);
};

File.prototype.isPasswordProtected = function() {
  return !!this.meta.hash;
};

File.prototype.authenticate = function(password, cb) {
  hash.compare(password, this.meta.hash, cb);
};

Object.defineProperty(File.prototype, "path", {
  get: function() {
    return File.dir + '/' + this.id;
  }
});

File.exists = function(id, cb) {
  fs.exists(File.dir + '/' + id, function(exists) {
    if (!exists) {
      return cb(Err('No such file', { status: 404 }));
    }

    cb();
  });
};

File.readMeta = function(id, cb) {
  fs.readFile(File.dir + '/' + id + '.json', 'utf8', errTo(cb, function(content) {
    cb(null, JSON.parse(content));
  }));
};

File.find = function(id, cb) {
  File.exists(id, errTo(cb, function() {
    File.readMeta(id, errTo(cb, function(meta) {
      cb(null, new File(meta, id));
    }));
  }));
};

File.dir = path.join(__dirname, '/../', config.filesDir);

debug('filesDir', File.dir);

module.exports = File;
