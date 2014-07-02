"use strict";

// Module dependencies
var express = require('express');
var app = express();
var flash = require('connect-flash');
var multiparty = require('connect-multiparty');
var config = require('./config.json');
var routes = require('./routes');
var db = require('./lib/db');

// View setup
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.locals = require('./helpers/index');

// Loading middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: config.sessionSecret,
  cookie: {
    maxAge: config.sessionMaxAge
  }
}));
app.use(flash());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Declaring application routes
app.get('/', routes.main.requireUserAuth, routes.files.index);
app.get('/files/:file', routes.main.requireUserAuth, routes.files.show);
app.del('/files/:file', routes.main.requireUserAuth, routes.files.destroy);
app.post('/files', multiparty(), routes.main.requireUserAuth, routes.files.create);
app.get('/users/new', routes.users.new);
app.post('/users', routes.users.create);
app.get('/sessions/new', routes.sessions.new);
app.post('/sessions', routes.sessions.create);
app.del('/sessions', routes.sessions.destroy);

// Establishing database connection and binding application to specified port
db.connect();
app.listen(config.port);
console.log('listening on port %s', config.port);
