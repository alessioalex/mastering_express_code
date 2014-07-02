"use strict";

var niceErr = require('nice-error');

module.exports = function(err) {
  err.timestamp = Date.now();
  console.error(niceErr(err));
  process.exit(1);
};
