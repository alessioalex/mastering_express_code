"use strict";

var fs = require('fs');
var express = require('express');
var app = express();

// non-stream version
// app.get('/big-file.txt', function(req, res, next) {
//   fs.readFile(__dirname + '/big-file.txt', 'utf8', function(err, content) {
//     if (err) { return res.status(500).send(‘Internal Error’); }
// 
//     res.send(content);
//   });
// });

// streaming version
app.get('/big-file.txt', function(req, res, next) {
  fs.createReadStream(__dirname + '/big-file.txt').on('error', function(err) {
    // handle error
  }).pipe(res);
});

// stream benefits:
// - lower memory usage: we just load a chunk into memory, process it and move on to the next chunk
// - finishing tasks earlier:
//   instead of waiting for the whole thing to load into memory and then process it as a whole
//   we load chunk by chunk and process it right away, so that when we finish the work with the final chunk we are done

app.listen(7777);
