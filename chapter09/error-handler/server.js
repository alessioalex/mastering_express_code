"use strict";

var express = require('express');
var app = express();
var errorHandler = require('./lib/error-handler');
var ENV = process.env.NODE_ENV || 'development';
var debug = require('debug')('timezone-app:main');

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

var routes = require('./routes');

// no favicon
app.get('/favicon.ico', function(req, res, next) {
  res.status(404).end();
});

app.use(express.static(__dirname + '/public'));

if (ENV === 'development') {
  app.get('/open-editor/*', errorHandler.openEditor);
}

app.get('/', routes.timezones.index);
app.get('/*', routes.timezones.show);

if (ENV === 'development') {
  app.use(errorHandler.displayDetails);
}

app.listen(process.env.PORT || 7777);
debug('application started on port %s', process.env.PORT || 7777);
