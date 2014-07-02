"use strict";

var request = require('supertest');
var should = require('should');
var app = require('../../server');
var db = require('../utils/db');

var user = require('../fixtures/users.json')[0];

describe('User-Routes', function(done) {
  before(function(done) {
    db.setupDatabase(done);
  });

  after(function(done) {
    db.reset(done);
  });

  it('should return the user details', function(done) {
    request(app)
      .get('/users/' + user.username)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { throw err; }

        res.body.should.have.properties('username', 'email', 'name');

        done();
      });
  });

  it('should create a new user', function(done) {
    request(app)
      .post('/users')
      .send({
        username: 'newuser',
        password: 'newuser_password',
        email: 'newuser@example.com',
        name: 'doe'
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', '/users/newuser')
      .expect({
        username: 'newuser',
        email: 'newuser@example.com',
        name: 'doe'
      }, done);
  });

  it('should update the current user', function(done) {
    request(app)
      .patch('/users/' + user.username)
      .set('Authorization', 'Basic ' + new Buffer(user.username + ':' + user.password).toString('base64'))
      .send([{
        op: 'replace',
        path: '/email',
        value: 'johndoe_the_third@example.com'
      }, {
        op: 'replace',
        path: '/name',
        value: 'John Doe The Third'
      }])
      .expect(204, done);
  });

});
