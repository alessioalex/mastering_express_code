"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var validator = require('../lib/validator');

var User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: [{
      validator: validator.validate('isAlphanumeric'),
      msg: 'username must be alphanumeric'
    }, {
      validator: validator.validate('isLength', 4, 255),
      msg: 'username must have 4-255 chars'
    }]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.validate('isEmail')
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
