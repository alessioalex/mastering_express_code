"use strict";

var request = require('supertest');
var should = require('should');
var app = require('../../server');
var db = require('../utils/db');

var user = require('../fixtures/users.json')[0];
var note = require('../fixtures/notes.json')[0];

describe('Notes-Routes', function(done) {
  before(function(done) {
    db.setupDatabase(done);
  });

  after(function(done) {
    db.reset(done);
  });

  it("should return the user's notes", function(done) {
    request(app)
      .get('/notes')
      .set('Authorization', 'Basic ' + new Buffer(user.username + ':' + user.password).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { throw err; }

        res.body.should.be.an.Array;

        done();
      });
  });

  it("should retrieve a particular note", function(done) {
    request(app)
      .get('/notes/' + note._id)
      .set('Authorization', 'Basic ' + new Buffer(user.username + ':' + user.password).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { throw err; }

        res.body.should.have.properties('createdAt', 'updatedAt', '_id', 'userId', 'title', 'description');

        done();
      });
  });

  it("should create a note", function(done) {
    request(app)
      .post('/notes')
      .set('Authorization', 'Basic ' + new Buffer(user.username + ':' + user.password).toString('base64'))
      .send({
        title: 'my random note',
        description: 'random description here'
      })
      .expect(201)
      .expect('Location', /\/notes\/[0-9a-f]{24}/)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { throw err; }

        res.body.should.have.properties('createdAt', 'updatedAt', '_id', 'userId', 'title', 'description');

        done();
      });
  });

  it("should return the user's public notes", function(done) {
    request(app)
      .get('/users/' + user.username + '/notes')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { throw err; }

        res.body.should.be.an.Array;
        res.body.forEach(function(note) {
          note.public.should.be.true;
        });

        done();
      });
  });


});
