"use strict";

var express = require('express');
var app = express();

var ejs = require('secure-filters').configure(require('ejs'));

// view setup
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);

var users = {
  1: {
    name: 'John Doe',
    alias: 'john',
    description: '<script>alert("hacked!")</script>',
    color: '#CCC;" onload="javascript:alert(\'yet another hack!\')',
    config: {
      motto: "</script><script>alert('hacked again!!');</script>"
    },
    id: 1
  }
};

app.use('/users/:id', function(req, res, next) {
  res.render('user-secure', {
    user: users[req.params.id]
  });
});

app.listen(7777);
