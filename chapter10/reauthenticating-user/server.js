"use strict";

var express = require('express');
var app = express();
var session = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var csrf = require('csurf');

// view setup
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'aqEosdP3%osn',
  maxAge: (30 * 60 * 1000) // expires in 30 minutes
}));
app.use(bodyParser());
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;

    return method;
  }
}));
app.use(csrf());
app.use(function(req, res, next) {
  if (req.method === 'GET') {
    res.locals.csrf = function() {
      return "<input type='hidden' name='_csrf' value='" + req.csrfToken() + "' />";
    }
  }

  next();
});

// using this only in development instead of a real db
var users = {
  john: 'password'
};

app.get('/', function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('home');
});

app.get('/login', function(req, res, next) {
  res.render('login');
});

app.post('/login', function(req, res, next) {
  if (users[req.body.username] === req.body.password) {
    req.session.loggedInTime = new Date().getTime();
    req.session.user = req.body.username;
    res.redirect('/');
  } else {
    res.redirect('/login?login=unsuccessful');
  }
});

app.get('/sensitive-data', function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  var ago = (Date.now() - req.session.loggedInTime);

  if (ago <= 60000) {
    res.send('really sensitive data here');
  } else {
    res.redirect('/login');
  }
});

app['delete']('/logout', function(req, res, next) {
  req.session = null;
  res.redirect('/login');
});

app.listen(7777);
