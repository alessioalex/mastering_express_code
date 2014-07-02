"use strict";

var express = require('express');
var _ = require('lodash');
var db = require('../lib/db');
var publicAttributes = ['username', 'email', 'name'];

exports.show = function(req, res, next) {
  req.User.findOne({ username: req.params.username }, function(err, userData) {
    if (err) { return next(err); }

    if (!userData) {
      return res.status(404).send({ errors: ['user not found'] });
    }

    res.send(_.pick(userData, publicAttributes));
  });
};

exports.create = function(req, res, next) {
  var newUser = new req.User(_.pick(req.body, publicAttributes));

  req.User.register(newUser, req.body.password, function(err, userData) {
    if (err) {
      if (db.isValidationError(err)) {
        res.status(422).send({ errors: ['invalid data'] });
      } else if (db.isDuplicateKeyError) {
        res.status(422).send({ errors: ['username/email already exists'] });
      } else {
        next(err);
      }
    } else {
      res
        .status(201)
        .set('Location', '/users/' + userData.username)
        .send(_.pick(userData, publicAttributes));
    }
  });
};

// using the JSON Patch protocol http://tools.ietf.org/html/rfc6902
exports.update = function(req, res, next) {
  function saveAndRespond(user) {
    user.save(function(err, userData) {
      if (err) {
        if (db.isValidationError(err)) {
          res.status(422).send({ errors: ['invalid data'] });
        } else if (db.isDuplicateKeyError) {
          res.status(422).send({ errors: ['email already exists'] });
        } else {
          next(err);
        }
      } else {
        res.status(204).send();
      }
    });
  };

  if (req.params.username !== req.user.username) {
    return res.status(403).send({ errors: ['cannot update other users'] });
  } else {
    if (!Array.isArray(req.body)) {
      return res.status(400).send({ errors: ['use JSON Patch'] });
    } else {
      if (req.body.some(function(item) { return item.op !== 'replace'; })) {
        return res.status(422).send({ errors: ['only replace is supported atm'] });
      } else {
        req.User.findOne({ username: req.user.username }, function(err, user) {
          if (err) { return next(err); }

          if (!user) {
            return res.status(404).send({ errors: ['no such user'] });
          }

          req.body.forEach(function(item) {
            // shouldn't be able to change username
            if (item.path !== '/username') {
              user[item.path.replace(/^\//, '')] = item.value;
            }
          });

          // handling special password case
          if (user.password) {
            var password = user.password;
            delete user.password;

            // function from passport-local-mongoose
            user.setPassword(password, function(err) {
              if (err) { return next(err); }

              saveAndRespond(user);
            });
          } else {
            saveAndRespond(user);
          }
        });
      }
    }
  }
};

// automatically sets req.user if found
exports.authenticate = function(req, res, next) {
  express.basicAuth(function(user, pass, fn) {
    // function from passport-local-mongoose
    req.User.authenticate()(user, pass, function(err, userData) {
      // no need to store salt and hash
      fn(err, _.pick(userData, ['_id', 'username', 'email', 'name']));
    });
  })(req, res, next);
};
