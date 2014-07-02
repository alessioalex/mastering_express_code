"use strict";


var express = require('express');
var app = express();

app.use(function(req, res, next) {
  req.session = { user: 'John', email: 'john@example.com' };
  next();
});

app.get('/', function(req, res, next) {
  

  res.send('ok');
});

app.listen(5555);
