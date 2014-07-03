"use strict";

var express = require('express');
var app = express();
var logger = require('morgan');
var fs = require('fs');

app.use(logger('dev'));

app.get('/', function(req, res, next) {
  res.send('Hello world');
});
app.get('/error', function(req, res, next) {
  next(new Error('manually triggered error'));
});

// if the request reaches this middleware it means
// it didn't match any route, so it's a '404 - Page Not Found' error
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.statusCode = 404;

  // pass the error to the custom error handler below
  next(err);
});

var notFoundPage = fs.readFileSync(__dirname + '/404.html').toString('utf8');
var internalErrorPage = fs.readFileSync(__dirname + '/500.html').toString('utf8');

// custom error handler where we handle errors passed by other middleware
app.use(function(err, req, res, next) {
  // if not specified, the statusCode defaults to 500
  // meaning it’s an internal error
  err.statusCode = err.statusCode || 500;

  switch(err.statusCode) {
    case 500:
      // when using Ajax we're usually expecting JSON, so in those situations
      // it's good to be consistent and respond with JSON when errors occur:
      if (req.xhr) {
        return res.status(err.statusCode).send({ error: '500 - Internal Server Error' });
      }

      res.format({
        text: function() {
          res.status(500).send('500 - Internal Server Error');
        },
        html: function() {
          res.status(err.statusCode).send(internalErrorPage);
        },
        json: function() {
          // $ curl -H "Accept: */json" http://localhost:7777/error
          // {
          //   "error": "500 - Internal Server Error"
          // }
          res.status(err.statusCode).send({ error: '500 - Internal Server Error' });
        }
      });
      // log the error to stderr
      console.error(err.stack);
      break;
    case 404:
      res.status(err.statusCode).send(notFoundPage);
      break;
    default:
      console.error('Unhandled code', err.statusCode, err.stack);
      res.status(err.statusCode).send('An error happened');
  }
});

app.listen(7777);
console.log('environment: %s', process.env.NODE_ENV || 'development');
