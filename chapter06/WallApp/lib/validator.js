"use strict";

var validator = require('validator');
var extend = require('extend');
var memoize = require('memoizejs');

var customValidator = extend({}, validator);

customValidator.validate = function(method) {
  if (!customValidator[method]) {
    throw new Error('validator method does not exist');
  }

  // get an array of the arguments except the first one (the method name)
  var args = Array.prototype.slice.call(arguments, 1);

  return function(value) {
    return customValidator[method].apply(customValidator, Array.prototype.concat(value, args));
  };
};

customValidator.validate = memoize(customValidator.validate);

module.exports = customValidator;
