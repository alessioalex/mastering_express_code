"use strict";

var tz = require('../lib/tz');
var timezoneJS = tz.timezoneJS;
var debug = require('debug')('timezone-app:routes:timezones');

exports.index = function(req, res, next) {
  res.render('home', {
    zones: tz.zones
  });
};

exports.show = function(req, res, next) {
  var place = req.url.slice(1);

  debug('showing time for %s', place);

  var time = new timezoneJS.Date(Date.now(), place).toString();
  res.render('time', {
    time: time,
    timezone: place
  });
};
