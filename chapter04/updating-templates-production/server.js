var express = require('express');
var app = express();

var ejs = require('ejs');
var jade = require('jade');
var hbs = require('express-hbs');
var swig = require('swig');

app.set('views', __dirname + '/views');

app.engine('hbs', hbs.express3({
  partialsDir: [__dirname + '/views']
}));

app.engine('swig', swig.renderFile);

app.get('/', function(req, res, next) {
  res.render('example.ejs');
});

app.get('/jade', function(req, res, next) {
  res.render('example.jade');
});

app.get('/hbs', function(req, res, next) {
  res.render('example.hbs');
});

app.get('/swig', function(req, res, next) {
  res.render('example.swig');
});

app.get('/clean-cache', function(req, res, next) {
  swig.invalidateCache();
  ejs.clearCache();
  jade.cache = {};
  hbs.cache = {};

  res.end('Cache cleared');
});

/*
var watch = require('watch')
watch.createMonitor(__dirname + '/views', function(monitor) {
  monitor.on("changed", function(file) {
    swig.invalidateCache();
    ejs.clearCache();
    jade.cache = {};
    hbs.cache = {};
  });
});
*/

app.listen(7777);
