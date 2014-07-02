"use strict";

var express = require('express');
var app = express();

function getByteStats(socket, cb) {
  var bytesRead, bytesWritten;

  // header 'Connection' is set to 'keep-alive', meaning we reuse the socket
  if (!socket.destroyed) {
    bytesRead = socket.bytesRead - (socket.___previousBytesRead || 0);
    bytesWritten = socket.bytesWritten - (socket.___previousBytesWritten || 0);

    // HACK: remember previously read/written bytes
    // since we're dealing with the same socket
    // (header 'Connection' set to 'keep-alive')
    socket.___previousBytesRead = socket.bytesRead;
    socket.___previousBytesWritten = socket.bytesWritten;
  } else {
    // header 'Connection' is set to 'closed', meaning the socket is destroyed
    bytesRead = socket.bytesRead;
    bytesWritten = socket.bytesWritten;
  }

  cb({ read: bytesRead, written: bytesWritten });
}

var totalBytesRead = 0;
var totalBytesWritten = 0;
app.use(function(req, res, next) {
  var cb = function(bytes) {
    totalBytesRead += bytes.read;
    totalBytesWritten += bytes.written;
  };

  res.once('close', getByteStats.bind(null, req.socket, cb));
  res.once('finish', getByteStats.bind(null, req.socket, cb));

  next();
});

app.get('/bytes', function(req, res, next) {
  res.json({
    read: totalBytesRead,
    written: totalBytesWritten
  });
});

app.get('*', function(req, res, next) {
  // res.writeHead(200, { 'Connection': 'close' });
  require('fs').createReadStream(__filename).pipe(res);
});

app.listen(process.env.PORT || 7777);
