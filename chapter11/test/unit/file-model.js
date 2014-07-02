"use strict";

var should = require('should');
var path = require('path');
var config = require('../../config.json');
var sinon = require('sinon');

// will be stubbing methods on these modules later on
var fs = require('fs');
var hash = require('../../lib/hash');

var noop = function() {};

describe('models', function() {
  describe('File', function() {
    var File = require('../../models/file');

    it('should have default properties', function() {
      var file = new File();

      file.id.should.be.a.String;
      file.meta.uploadedAt.should.be.a.Date;
    });

    it('should return the path based on the root and the file id', function() {
      var file = new File({}, '1');
      file.path.should.eql(File.dir + '/1');
    });

    it('should move a file', function() {
      var stub = sinon.stub(fs, 'rename');

      var file = new File({}, '1');
      file.move('/from/path', noop);

      stub.calledOnce.should.be.true;
      stub.calledWith('/from/path', File.dir + '/1', noop).should.be.true;

      stub.restore();
    });

    it('should save the metadata', function() {
      var stub = sinon.stub(fs, 'writeFile');
      var file = new File({}, '1');
      file.meta = { a: 1, b: 2 };

      file.saveMeta(noop);

      stub.calledOnce.should.be.true;
      stub.calledWith(File.dir + '/1.json', JSON.stringify(file.meta), noop).should.be.true;

      stub.restore();
    });

    it('should check if file is password protected', function() {
      var file = new File({}, '1');

      file.meta.hash = 'y';
      file.isPasswordProtected().should.be.true;

      file.meta.hash = null;
      file.isPasswordProtected().should.be.false;
    });

    it('should allow access if matched file password', function() {
      var stub = sinon.stub(hash, 'compare');

      var file = new File({}, '1');
      file.meta.hash = 'hashedPwd';
      file.authenticate('password', noop);

      stub.calledOnce.should.be.true;
      stub.calledWith('password', 'hashedPwd', noop).should.be.true;

      stub.restore();
    });

    describe('.dir', function() {
      it('should return the root of the files folder', function() {
        path.resolve(__dirname + '/../../' + config.filesDir).should.eql(File.dir);
      });
    });

    describe('.exists', function() {
      var stub;

      beforeEach(function() {
        stub = sinon.stub(fs, 'exists');
      });

      afterEach(function() {
        stub.restore();
      });

      it('should callback with an error when the file does not exist', function(done) {
        File.exists('unknown', function(err) {
          err.should.be.an.instanceOf(Error).and.have.property('status', 404);
          done();
        });

        // call the function passed as argument[1] with the parameter `false`
        stub.callArgWith(1, false);
      });

      it('should callback with no arguments when the file exists', function(done) {
        File.exists('existing-file', function(err) {
          (typeof err === 'undefined').should.be.true;
          done();
        });

        // call the function passed as argument[1] with the parameter `true`
        stub.callArgWith(1, true);
      });
    });

  });
});
