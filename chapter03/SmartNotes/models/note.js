"use strict";

var validator = require('../lib/validator');
var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Note = new Schema({
  title: {
    type: String,
    required: true,
    validate: validator.validate('isLength', 3, 255)
  },
  description: {
    type: String,
    required: true,
    validate: validator.validate('isLength', 10, 255)
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  category: {
    type: String,
    default: 'general'
  },
  public: {
    type: Boolean,
    default: false
  }
});

Note.plugin(timestamps);

module.exports = mongoose.model('Note', Note);
