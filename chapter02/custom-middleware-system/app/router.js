"use strict";

var util = require('util');
var pathToRegexp = require('path-to-regexp');
var App = require('./index');
var url = require('url');

function getPathname(str) {
  return url.parse(str).pathname;
}

function Router() {
  if (!(this instanceof Router)) {
    return new Router();
  }

  // call the 'super' constructor
  App.call(this);
}

util.inherits(Router, App);

var VERBS = ['all', 'get', 'post', 'put', 'delete', 'head', 'options'];
VERBS.map(function(verb) {
  Router.prototype[verb] = function(path, fn) {
    var _this = this;
    var keys = [];
    // in case path is a string, transform it into an Express-type RegExp
    var regex = (path.constructor.name === 'RegExp') ? path : pathToRegexp(path, keys);

    var args = Array.prototype.slice.call(arguments);
    // multiple handlers (functions) can be specified for a given path
    var handlers = args.slice(1);

    handlers.forEach(function(fn) {
      _this.use(function(req, res, next) {
        // app.all behaves like a regular verb (for example: app.get),
        // but it matches all HTTP verbs
        if ((verb !== 'all') && (req.method !== verb.toUpperCase())) { return next(); }
        // '*' matches all routes
        if ((path !== '*') && !regex.test(getPathname(req.url))) { return next(); }

        var params = regex.exec(getPathname(req.url)).slice(1);

        if (keys.length) {
          req.params = {};
          keys.forEach(function(key, i) {
            if (params[i]) {
              req.params[key.name] = params[i];
            }
          });
        } else {
          req.params = {};
        }

        fn(req, res, next);
      });
    });
  }
});

module.exports = Router;
