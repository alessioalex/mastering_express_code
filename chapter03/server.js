"use strict";

var express = require('express');
var app = express();
var db = require('./lib/db');
var config = require('./config.json')[app.get('env')];

var mongoose = require('mongoose');
var User = require('./models/user');
var Note = require('./models/note');
var routes = require('./routes');

db.connect(config.mongoUrl);

app.use(express.favicon());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());

app.use(function(req, res, next) {
  req.User = User;
  req.Note = Note;
  next();
});

app.use(app.router);

app.get('/users/:username', routes.users.show);
app.post('/users', routes.users.create);
app.get('/users/:username/notes', routes.notes.showPublic);
app.patch('/users/:username', routes.users.authenticate, routes.users.update);
app.get('/notes', routes.users.authenticate, routes.notes.index);
app.post('/notes', routes.users.authenticate, routes.notes.create);
app.get('/notes/:id', routes.users.authenticate, routes.notes.show);

module.exports = app;

if (!module.parent) {
  app.listen(config.port);
  console.log('(%s) app listening on port %s', app.get('env'), config.port);
}
