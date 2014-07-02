var express = require('express');
var jade = require('jade');
var app = express();

app.set('views', __dirname + '/views');

app.get('/', function(req, res, next) {
  res.render('index.jade');
});

app.listen(7777);
