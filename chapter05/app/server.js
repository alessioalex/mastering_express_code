"use strict";

var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

var Movie = require('./models/movie');
var movie = new Movie(process.env.API_KEY);

app.use(function(req, res, next) {
  req.movie = movie;
  next();
});

var routes = require('./routes');
app.get('/', routes.movies.search);
app.get('/movies', routes.movies.index);
app.get('/movies/:id', routes.movies.show);
app.all('*', routes.errors.handleNotFound);

app.use(routes.errors.handleInternalError);

app.listen(7777);
