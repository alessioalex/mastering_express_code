"use strict";

var express = require('express');
var app = express();

app.set('view engine', 'ejs');

var store = {};

// /*
app.use(function cacheRender(req, res, next) {
  var getCacheFunction = function(res, key) {
    // callback expected by res.render()
    return function(err, content) {
      if (err) { throw err; }

      // store the content in cache and serve it to the client
      store[key] = content;
      res.send(content);
    };
  };
  // the URL pathname and the content represent the key - value pair in the cache store
  var pathname = req.path;

  var render = res.render;
  // if the compiled template isn't in the cache load it
  if (!store[pathname]) {
    res.render = function() {
      var args = Array.prototype.slice.call(arguments);
      var cacheIt = getCacheFunction(res, pathname);

      // add the cache function to the arguments array
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
    // serve the content directly from the cache
    res.send(store[pathname]);
  }
});
// */

app.use(function respond(req, res, next) {
  res.render('hello', {
    visited: new Date(),
    url: req.url
  });
});

app.listen(7777);
console.log('Server started: http://localhost:7777/');
