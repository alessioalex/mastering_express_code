"use strict";

var express = require('express');
var app = express();
var multipart = require('connect-multiparty');
var gm = require('gm');
var fs = require('fs');

// view setup
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res, next) {
  res.render('home');
});

app.post('/files', multipart(), function(req, res, next) {
  if (!req.files.file) {
    return res.send('File missing');
  }

  gm(req.files.file.path).identify(function(err, data) {
    if (err) { return next(err); }

    fs.unlink(req.files.file.path, function() { /* ignored the error */ });

    res.send(data);
  });
});

app.listen(7777);
