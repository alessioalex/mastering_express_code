"use strict";

var express = require('express');
var app = express();

var tmpl = require('./engine');

app.locals.APP_NAME = 'Sample Express App';

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', tmpl.renderFile);

app.get('/', function(req, res, next) {
  res.render('home', { pageTitle: 'home' });
});

app.get('/now', function(req, res, next) {
  res.render('now', { pageTitle: 'now' });
});

var watch = require('watch')
watch.createMonitor(__dirname + '/views', function(monitor) {
  monitor.on("changed", function(file) {
    tmpl.cache = {};
  });
});

app.listen(7777);
