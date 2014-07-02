"use strict";

var debug = require('debug')('myapp:main');
var express = require('express');
var app = express();

app.use(function(req, res, next) {
  req.session = { user: 'John', email: 'john@example.com' };
  next();
});

app.get('/', function(req, res, next) {
  debug('user %s visited /', req.session.user);

  res.send('ok');
});

app.listen(process.env.PORT || 7777);

// Remote debug statements:
//
// $ groundskeeper -n debug < server.js > clean-server.js
