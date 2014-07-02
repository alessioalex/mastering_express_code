"use strict";

var http = require('http');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 7777;

app.get('*', function(req, res, next) {
  res.send({
    uid: process.getuid(),
    gid: process.getgid()
  });
});

http.createServer(app).listen(PORT, function() {
  console.log("Express server listening on port " + PORT);
  downgradeFromRoot();
});

function downgradeFromRoot() {
  if (process.env.SUDO_GID && process.env.SUDO_UID) {
    process.setgid(parseInt(process.env.SUDO_GID, 10));
    process.setuid(parseInt(process.env.SUDO_UID, 10));
  }
}

// Running this example:
//
// sudo PORT=80 node basic.js
