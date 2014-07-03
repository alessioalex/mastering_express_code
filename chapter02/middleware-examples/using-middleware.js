"use strict";

console.log('App process id (pid): %s', process.pid);

var express = require('express');
var morgan = require('morgan');
var app = express();

app.use('/public', express.static(__dirname + '/public'));
// each time somebody visits the admin URL
// log the ip address as well as other details
app.use('/admin', morgan({ immediate: true }));
app.use('/admin', function auth(req, res, next) {
  // normally you should authenticate the user somehow
  // but for the sake of the demo we just set the `isAdmin` flag directly
  req.isAdmin = true;
  next();
});
app.use(function respond(req, res) {
  if (req.isAdmin) {
    res.send('Hello admin!\n');
  } else {
    res.send('Hello user!\n');
  }
});

app.listen(7777);
console.log('server listening on port 7777');

// $ DEBUG=express:router node using-middleware.js
