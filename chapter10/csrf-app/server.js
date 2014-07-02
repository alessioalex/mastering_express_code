"use strict";

var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var csrf = require('csurf');

var app = express();

// view setup
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'a3Bys4#$2jTs'
}));
app.use(bodyParser());
app.use(csrf());

// in memory store this time
var orders = [];

app.use(function(req, res, next) {
  if (req.method === 'GET') {
    res.locals.csrf = function() {
      return "<input type='hidden' name='_csrf' value='" + req.csrfToken() + "' />";
    }
  }

  next();
});

app.get('/', function(req, res, next) {
  res.render('index');
});

app.post('/orders', function(req, res, next) {
  orders.push({
    details: req.body.order,
    placed: new Date()
  });

  res.redirect('/orders');
});

app.get('/orders', function(req, res, next) {
  res.render('orders', {
    orders: orders
  });
});

app.listen(3000);
