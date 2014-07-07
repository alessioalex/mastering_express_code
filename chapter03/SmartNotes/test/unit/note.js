"use strict";

var should = require('should');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var helpers = require('../utils/helpers');
var mongoose = helpers.getMongooseStub();

var shouldDefineSchemaProperty = helpers.shouldDefineSchemaProperty.bind(null, mongoose.Schema);
var shouldRegisterSchema = helpers.shouldRegisterSchema.bind(null, mongoose.model, mongoose.Schema);
var shouldBeRequired = helpers.shouldBeRequired.bind(null, mongoose.Schema);
var shouldBeA = helpers.shouldBeA.bind(null, mongoose.Schema);
var shouldDefaultTo = helpers.shouldDefaultTo.bind(null, mongoose.Schema);
var shouldBeBetween = helpers.shouldBeBetween.bind(null, mongoose.Schema);
var shouldValidateThat = helpers.shouldValidateThat.bind(null, mongoose.Schema);
var shouldLoadPlugin = helpers.shouldLoadPlugin.bind(null, mongoose.Schema);

describe('Note', function() {
  var Note, mongooseTimestamp;

  before(function() {
    mongooseTimestamp = sinon.stub();
    Note = proxyquire('../../models/note', {
      'mongoose-timestamp': mongooseTimestamp,
      'mongoose': mongoose
    });
  });

  it('should register the Mongoose model', function() {
    shouldRegisterSchema('Note');
  });

  it('should load the timestamps plugin', function() {
    shouldLoadPlugin(mongooseTimestamp);
  });

  describe('title', function() {
    it('should be required', function() {
      shouldBeRequired('title');
    });

    it('should be a string', function() {
      shouldBeA('title', String);
    });

    it('should have a length of 3-255 chars', function() {
      shouldValidateThat('title', 'isLength', 3, 255);
    });
  });

  describe('description', function() {
    it('should be required', function() {
      shouldBeRequired('description');
    });

    it('should be a string', function() {
      shouldBeA('description', String);
    });

    it('should have a length of 10-255 chars', function() {
      shouldValidateThat('description', 'isLength', 10, 255);
    });
  });

  describe('userId', function() {
    it('should be required', function() {
      shouldBeRequired('userId');
    });

    it('should be an ObjectId', function() {
      shouldBeA('userId', mongoose.Schema.ObjectId);
    });

    it('should reference the User model', function() {
      shouldDefineSchemaProperty({ userId: { ref: 'User' } });
    });
  });

  describe('rating', function() {
    it('should be a number', function() {
      shouldBeA('rating', Number);
    });

    it('should default to 0 (unrated)', function() {
      shouldDefaultTo('rating', 0);
    });

    it('should be between 0 and 10', function() {
      shouldBeBetween('rating', { min: 0, max: 10 });
    });
  });

  describe('category', function() {
    it('should be a string', function() {
      shouldBeA('category', String);
    });

    it('should default to general', function() {
      shouldDefaultTo('category', 'general');
    });
  });

  describe('public', function() {
    it('should be a boolean', function() {
      shouldBeA('public', Boolean);
    });

    it('should default to false', function() {
      shouldDefaultTo('public', false);
    });
  });
});
