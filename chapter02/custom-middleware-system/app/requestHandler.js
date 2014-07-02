"use strict";

var url = require('url');

function getPathname(str) {
  return url.parse(str).pathname;
}

function RequestHandler(stack, errorHandler, notFoundHandler) {
  this.index = 0;
  this.stack = stack;
  this.errorHandler = errorHandler || function(err, req, res) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Internal Server Error</h1><pre>' + err.stack + '</pre>');
  };
  this.notFoundHandler = notFoundHandler || function(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end("Cannot " + req.method.toUpperCase() + " " + req.url);
  };
}

RequestHandler.prototype.next = function(req, res) {
  if (this.index < this.stack.length) {
    var _next = (function(err) {
      if (!err) {
        this.next(req, res);
      } else {
        this.errorHandler(err, req, res);
      }
    }).bind(this);

    try {
      var middleware = this.stack[this.index++];

      if (middleware.route !== '/') {
        var regexp = new RegExp('^\/' + middleware.route.substring(1) + '\/?$');
        // custom route, so we need to alter the `req.url` and remove the 'root'
        if (regexp.test(getPathname(req.url))) {
          req.originalUrl = req.url;
          req.url = req.url.replace(middleware.route, '/');
        } else {
          // the route isn't matched, so we call `_next()`
          return _next();
        }
      }

      middleware.handle(req, res, _next);
    }
    catch(err) {
      this.errorHandler(err, req, res);
    }
  } else {
    this.notFoundHandler(req, res);
  }
}

module.exports = RequestHandler;
