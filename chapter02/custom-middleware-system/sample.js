"use strict";

var http = require('http');
var express = require('./app');
var app = express();

app.use(function(req, res, next) {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end('Hello world!');
  }
  next();
});

app.use('/404', function(req, res, next) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  return res.end('No such page.');
});

app.use('/500', function(req, res, next) {
  return next(new Error('something bad happened'));
});

var app2 = express();
app2.use('/app2', function(req, res, next) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  return res.end('Response from the second app.');
});

app.use(app2.handleRequest);

app.use(function(err, req, res, next) {
  res.writeHead(500, { 'Content-Type': 'text/html' });
  res.end('<h1>500 Internal Server Error</h1>');
});

http.createServer(app.handleRequest).listen(7777);
console.log('server listening on port 7777');
