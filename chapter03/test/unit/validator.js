"use strict";

var sinon = require('sinon');
var should = require('should');
var validator = require('../../lib/validator');
var proxyquire = require('proxyquire');

describe('validator', function() {
  describe('validate', function() {
    it("should throw an error if the delegated method doesn't exist", function() {
      delete validator.unknownMethod;
      (function() {
        validator.validate('unknownMethod');
      }).should.throw(/validator method does not exist/i);
    });

    it("should return a function", function() {
      validator.noop = function(){};
      validator.validate('noop').should.be.a.Function;
    });

    it("should be memoized", function() {
      var noop = sinon.stub();
      var memoize = sinon.spy(function(fn) { return noop; });
      var validator = proxyquire('../../lib/validator', {
        'memoizejs': memoize
      });

      memoize.calledOnce.should.be.true;
      validator.validate.should.eql(noop);
    });

    describe("inner function", function() {
      it("should call the delegated method with the arguments in order", function() {
        var method = sinon.spy();

        validator.myCustomValidationMethod = method;
        validator.validate('myCustomValidationMethod', 1, 2, 3)('str');

        method.calledWith('str', 1, 2, 3).should.be.true;
      });
    });
  });
});
