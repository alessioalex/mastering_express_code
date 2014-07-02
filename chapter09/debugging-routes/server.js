"use strict";

var express = require('express');
var app = express();
var inspect = require('util').inspect;
var morgan = require('morgan');

var users = [{ name: 'John Doe', age: 27 }];

app.use(morgan());

app.route('/users').get(function(req, res, next) {
  res.send(users);
}).post(function(req, res, next) {
  res.send('ok');
});

app._router.stack.forEach(function(item) {
  if (item.route) {
    console.log('Route: %s', inspect(item.route, { depth: 5 }));
  } else {
    console.log('Middleware: %s', item.handle.name || 'anonymous');
  }
  console.log('--------------------');
});

app.listen(process.env.PORT || 7777);
