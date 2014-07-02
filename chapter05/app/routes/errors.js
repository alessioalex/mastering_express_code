"use strict";

var STATUS_CODES = require('http').STATUS_CODES;

// 500 - Internal Server Error
exports.handleInternalError = function(err, req, res, next) {
  var html = '';

  if (err.code === 404 || /not found/.test(err.message)) {
    return exports.handleNotFound(req, res, next);
  } else if (err.code && STATUS_CODES[err.code]) {
    html  = '<h1>' + err.code + ' - ' + STATUS_CODES[err.code] + '</h1>';
    html += '<p>' + err.message + '</p>';

    res.send(err.code, html);
  } else {
    console.error(err.stack);
    res.send(500, '<h1>500 - Internal Server Error</h1>');
  }
};

exports.handleNotFound = function(req, res, next) {
  res.send(404, '<h1>404 - Page Not Found</h1>');
};
