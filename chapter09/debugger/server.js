"use strict";

var express = require('express');
var app = express();
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Faker = require('Faker');

app.use(morgan('dev'));
app.use(cookieParser()); // required before session.
app.use(session({
  secret: 'secret keyword'
}));

app.get('/', function(req, res, next) {
  debugger;

  if (req.session.name) {
    res.redirect('/whoami');
  }

  debugger;

  var secretIdentity = {
    name: Faker.Name.findName(),
    email: Faker.Internet.email()
  };

  req.session.name = secretIdentity.name;
  req.session.email = secretIdentity.email;

  var tmpl = 'We will call you ' + secretIdentity.name;
  tmpl += ' from now on and email you at ' + secretIdentity.email;
  tmpl += '</br > Reset your identity by going to the following URL: ';
  tmpl += '<a href="/refresh">/refresh</a>';

  res.send(tmpl);
});

app.get('/whoami', function(req, res, next) {
  res.send('Name ' + req.session.name + ' | Email: ' + req.session.email);
});

app.get('/refresh', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) { return next(err); }

    res.redirect('/');
  });
});

app.listen(process.env.PORT || 7777);

// $ node debug server.js
// then 'cont'
// then visit the / page in the browser
// then 'repl' => tada, access to context
//
// http://nodejs.org/api/debugger.html
