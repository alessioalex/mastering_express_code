"use strict";

var express = require('express');
var app = express();

app.set('view engine', 'ejs');

var cacheRender = function(store, urlsToCache) {
  var store = store || {};
  // if urlsToCache is not provided that means that all urls will be cached
  var urlsToCache = urlsToCache || [];

  return function(req, res, next) {
    var render = res.render;
    var getCacheFunction = function(res, id) {
      return function(err, content) {
        if (err) { throw err; }

        store[id] = content;
        res.send(content);
      };
    };
    var pathname = req.path;

    // if there are specific urls to be cached, but this one isn't in the list
    // then skip and go to the next middleware in the stack
    if ((urlsToCache.length !== 0) && (urlsToCache.indexOf(pathname) === -1)) {
      return next();
    }

    if (!store[pathname]) {
      res.render = function() {
        var args = Array.prototype.slice.call(arguments);
        var cacheIt = getCacheFunction(res, pathname);

        if (args.length < 2) {
          args[1] = cacheIt;
        } else {
          if (typeof args[1] === 'function') {
            args[1] = cacheIt;
          } else {
            args[2] = cacheIt;
          }
        }
        render.apply(res, args);
      };

      next();
    } else {
      res.send(store[pathname]);
    }
  };
};

var store = {
  '/index' : 'Hello from the index page\n'
};
var urlsToCache = ['/index', '/test'];
app.use(cacheRender(store, urlsToCache));

app.use(function(req, res, next) {
  res.render('hello', {
    visited: new Date(),
    url: req.url
  });
});

app.listen(7777);
