"use strict";

var express = require('express');
var app = express();
var stream = require('stream');
var trumpet = require('trumpet');
var fs = require('fs');

var template = fs.readFileSync('./template.html', 'utf8');

var data = ['Store A - socks $1', 'Store B - socks $2', 'Store C - socks $10', 'Store D - socks 100$'];

var getData = function() {
  var readableStream = new stream.Readable();
  readableStream.setEncoding('utf8');
  readableStream._read = function(size) {};
  var counter = 0;

  var interval = setInterval(function() {
    if (counter >= data.length) {
      readableStream.push(null);
      return clearInterval(interval);
    }
    readableStream.push(data[counter]);
    counter++;
  }, 1000);

  return readableStream;
};

app.get('/', function(req, res, next) {
  var tr = trumpet();
  // writable stream
  var ws = tr.select('ul').createWriteStream();

  setImmediate(function() {
    tr.write(template);
    tr.end();
  });

  getData().on('data', function(data) {
    ws.write('<li>' + data + '</li>');
  }).on('end', function() {
    ws.end();
  });

  tr.pipe(res);
});

app.listen(7777);
