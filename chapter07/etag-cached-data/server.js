"use strict";

var handleEtag = function(req, res, next) {
  res.cachable = function(etag, isStaleCallback) {
    if (!etag) {
      throw new Error('Etag required');
    }

    res.set({ 'ETag': etag });

    // 304 Not Modified
    if (req.fresh) {
      // remove content headers
      if (res._headers) {
        Object.keys(res._headers).forEach(function(header) {
          if (header.indexOf('content') === 0) {
            res.removeHeader(header);
          }
        });
      }

      res.statusCode = 304;
      return res.end();
    } else {
      // load dynamic content now
      isStaleCallback();
    }
  };

  next();
};

var express = require('express');
var app = express();

var getEtag = function(key, cb) {
  return setImmediate(function() {
    cb(null, '4ALOzWNKcFh6OImOu5t68l0C2os=');
  });
};

app.get('/cached-data', handleEtag, function(req, res, next) {
  getEtag('cached-data', function(err, etag) {
    if (err) { return next(err); }

    res.cachable(etag, function() {
      // the second time you visit the page this won't get called
      console.log('loading dynamic content');
      res.send('Big content loaded from database/cache/filesystem here.');
    });
  });
});

app.listen(7777);
