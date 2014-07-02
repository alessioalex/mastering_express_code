"use strict";

var replify = require('replify');
var express = require('express');
var app = express();

app.use(function(req, res, next) {
  res.send('all good');
});

app.listen(process.env.PORT || 7777);
replify('replify-app-' + process.pid, app);
console.log('Use the command below to connect to the REPL:');
console.log('rc /tmp/repl/replify-app-' + process.pid + '.sock');
