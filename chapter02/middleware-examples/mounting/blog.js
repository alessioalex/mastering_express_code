"use strict";

var express = require('express');
var app = express();

app.get('/', function(req, res, next) {
  res.send('Blog app says hello');
});

app.get('/error', function(req, res, next) {
  return next(new Error('err'));
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send('BLOG: an error occured');
});

module.exports = app;
