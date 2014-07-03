"use strict";

var http = require('http');
var express = require('./app/router');
var app = express();

app.get('/', function(req, res, next) {
  req.message = 'Hello';
  next();
}, function(req, res, next) {
  req.message += ' World!';
  next();
}, function(req, res, next) {
  res.end(req.message);
});

app.get('/app2', function(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('app2');
});

app.get('/users/:user/:name?', function(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(JSON.stringify(req.params));
});

app.all('*', function(req, res, next) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('404 - Page Not Found');
});

http.createServer(app.handleRequest).listen(7777);
console.log('server listening on port 7777');
