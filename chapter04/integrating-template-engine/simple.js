"use strict";

var express = require('express');
var app = express();

app.locals.APP_NAME = 'Sample Express App';

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', function() { console.log(arguments); });

app.get('/', function(req, res, next) {
  res.render('home', {
    firstLocal: 1,
    secondLocal: 2
  });
});

app.listen(7777);
