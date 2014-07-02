"use strict";

var express = require('express');
var app = express();

app.get('/blog/:slug.:format', function(req, res, next) {
  res.send('Hello world');
});

console.log(app.routes);

app.listen(7777);
