"use strict";

/*
var fs = require('fs');
var fsStat = fs.stat;
fs.stat = function(path, cb) {
  console.log('fs.stat: ' + path);
  fsStat(path, cb);
};
*/

var express = require('express');
var app = express();
var ejs = require('ejs');
var morgan = require('morgan');
var versionator = require('versionator');
var serve = require('serve-static');
var compress = require('compression')();
var buffet = require('buffet');

// when running behind NGiNX
app.set('trust proxy', true);

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.version = process.env.VERSION || '0.1';
var versionate = versionator.createBasic('v' + app.version);
app.locals.getResourcePath = versionate.versionPath;

if (process.env.NODE_ENV !== 'production') {
  // logger
  app.use(morgan('tiny'));
}

// enable gzip compression
app.use(compress);

// remove the version from the URL so the serve middleware works as expected
app.use('/assets', versionate.middleware);

if (process.env.NODE_ENV === 'production') {
  app.use('/assets', buffet({
    maxAge: (1000 * 60 * 60 * 24 * 31)
  }));
} else {
  // serving static files (that expire after a month)
  app.use('/assets', serve(__dirname + '/public', {
    maxAge: (1000 * 60 * 60 * 24 * 31)
  }));
}

app.get('/', function(req, res, next) {
  res.render('home');
});

app.listen(process.env.PORT || 7777);
