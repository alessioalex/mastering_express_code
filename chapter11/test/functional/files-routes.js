"use strict";

var fs = require('fs');
var request = require('supertest');
var should = require('should');
var async = require('async');
var cheerio = require('cheerio');
var rimraf = require('rimraf');
var app = require('../../app');

function uploadFile(agent, password, done) {
  agent
    .get('/files')
    .expect(200)
    .end(function(err, res) {
      (err == null).should.be.true;

      var $ = cheerio.load(res.text);
      var csrfToken = $('form input[name=_csrf]').val();

      csrfToken.should.not.be.empty;

      var req = agent
        .post('/files')
        .field('_csrf', csrfToken)
        .attach('file', __filename);

      if (password) {
        req = req.field('password', password);
      }

      req
        .expect(302)
        .expect('Location', /files\/(.*)\.html/)
        .end(function(err, res) {
          (err == null).should.be.true;

          var fileUid = res.headers['location'].match(/files\/(.*)\.html/)[1];

          done(null, fileUid);
        });
    });
}

describe('Files-Routes', function(done) {
  after(function() {
    var filesDir = __dirname + '/../../files';
    rimraf.sync(filesDir);
    fs.mkdirSync(filesDir);
  });

  describe("Uploading a file", function() {
    it("should upload a file without password protecting it", function(done) {
      var agent = request.agent(app);

      uploadFile(agent, null, done);
    });

    it("should upload a file and password protect it", function(done) {
      var agent = request.agent(app);
      var pwd = 'sample-password';

      uploadFile(agent, pwd, function(err, filename) {
        async.parallel([
          function getWithoutPwd(next) {
            agent
              .get('/files/' + filename + '.html')
              .expect(401)
              .end(function(err, res) {
                (err == null).should.be.true;
                next();
              });
          },
          function getWithPwd(next) {
            agent
              .get('/files/' + filename + '.html')
              .set('Authorization', 'Basic ' + new Buffer(':' + pwd).toString('base64'))
              .expect(200)
              .end(function(err, res) {
                (err == null).should.be.true;
                next();
              });
          }
        ], function(err) {
          (err == null).should.be.true;
          done();
        });
      });
    });
  });
});
