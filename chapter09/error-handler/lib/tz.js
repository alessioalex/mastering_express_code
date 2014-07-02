"use strict";

var timezoneJS = require('timezone-js');
var tz = timezoneJS.timezone;
var zoneData = require('../all_cities.json');

var zones = Object.keys(zoneData.zones);

tz.loadingScheme = tz.loadingSchemes.MANUAL_LOAD;
tz.loadZoneDataFromObject(zoneData);

module.exports = {
  timezoneJS: timezoneJS,
  zones: zones
};
