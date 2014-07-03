"use strict";

var express = require('express');
var app = express();

app.enable('trust proxy');

app.use(function(req, res, next) {
  var ip = req.ip;

  if (ip === '127.0.0.1' || /^192\.168\./.test(ip)) {
    next();
  } else {
    res.status(403).send('Forbidden!\n');
  }
});

app.get('*', function(req, res, next) {
  res.send('Hello world');
});

app.listen(process.env.PORT || 7777);
