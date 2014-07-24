"use strict";

var Primus = require('primus');

module.exports = function startPrimus(server, opts) {
  opts = opts || {};

  var primus = new Primus(server, {
    transformer: opts.transformer || 'websockets',
    parser: opts.parser || 'json',
    pathname: opts.pathname || '/primus'
  });

  return function broadcast(msg) {
    primus.write(msg);
  };
};
