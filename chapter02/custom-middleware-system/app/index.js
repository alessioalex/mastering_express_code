"use strict";

var RequestHandler = require('./requestHandler');
var util = require('util');

function App() {
  // allows us to call App() without using the `new` keyword
  if (!(this instanceof App)) {
    return new App();
  }

  this.stack = [];
  this.handleRequest = this.handleRequest.bind(this);
}

App.prototype.use = function(route, fn) {
  if (typeof route !== 'string') {
    fn = route;
    route = '/';
  }

  // strip trailing slash
  if (route !== '/' && route[route.length - 1] === '/' ) {
    route = route.slice(0, -1);
  }

  if (fn.length !== 4) {
    this.stack.push({
      handle: fn,
      route: route
    });
  } else {
    this.customErrorHandler = fn;
  }
};

App.prototype.handleRequest = function(req, res, _next) {
  var next;

  if (_next) {
    next = function(err) {
      if (util.isError(err)) {
        _next(err);
      } else {
        _next();
      }
    };
  }

  new RequestHandler(this.stack, this.customErrorHandler, next).next(req, res);
};

module.exports = App;
