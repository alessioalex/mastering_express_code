var express = require('express');
var app = express();

var crypto = require('crypto');
var handleEtag = function(req, res, next) {
  res.cachable = function(options, isStaleCallback) {
    var isJson;

    if (!options.etag && !options.content) {
      throw new Error('Please provide either etag or content');
    }

    if (options.etag) {
      res.set({ 'ETag': options.etag });
    } else {
      if (typeof options.content === 'object') {
        isJson = true;
        options.content = JSON.stringify(options.content);
      }

      var hash = crypto.createHash('md5');
      hash.update(options.content);
      res.set({ 'ETag': hash.digest('hex') });

      if (!isStaleCallback) {
        isStaleCallback = function() {
          if (isJson) { res.set({ 'Content-Type': 'application/json' }) }
          res.send(options.content);
        };
      }
    }

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
      isStaleCallback();
    }
  };

  next();
};

app.get('/fruits/:id', handleEtag, function(req, res, next) {
  res.cachable({ content: { id: req.params.id } });
});

app.get('/apples/:id', handleEtag, function(req, res, next) {
  res.cachable({ content: 'apple with id ' + req.params.id });
});

app.get('/oranges/:id', handleEtag, function(req, res, next) {
  // ..
  var etag = 'AbcAsaDAAsD123';

  res.cachable({ etag: etag }, function() {
    // ..
    res.send('I have an orange');
  });
});

app.listen(3333);
