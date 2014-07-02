var express = require('express');
var jade = require('jade');
var app = express();

app.engine('jade', jade.renderFile);
app.set('views', __dirname + '/views');

var users = require('./users.json');

app.get('/users', function(req, res, next) {
  res.render('users.jade', { users: users });
});

app.listen(7777);
