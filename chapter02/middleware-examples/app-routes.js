"use strict";

var express = require('express');
var util = require('util');
var app = express();

app.get('/blog/:slug.:format', function(req, res, next) {
  res.send('Hello world');
});

console.log(util.inspect(app._router.stack, null, 4));

app.listen(7777);
