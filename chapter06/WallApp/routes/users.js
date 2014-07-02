"use strict";

var passport = require('passport');
var User = require('../models/user');

exports.new = function(req, res, next) {
  res.render('register');
};

exports.create = function(req, res, next) {
  var newUser = new User({
    username : req.body.username,
    email : req.body.email
  });

  User.register(newUser, req.body.password, function(err, user) {
    var errMessage;

    if (err) {
      // failed validation || duplicate key shouldn't result in a 500 error page
      // we should display the form with an error message instead
      if (err.name === 'BadRequestError' || err.name === 'ValidationError' || err.name === 'MongoError') {
        // showing specific messages for some situations
        if (err.name === 'MongoError' && err.code === 11000) {
          errMessage = 'username/email already exists';
        } else if (err.name === 'ValidationError') {
          errMessage = 'Validation failed for the following fields: ' + Object.keys(err.errors).join(', ');
        }

        return res.render("register", {
          error: errMessage || err.message
        });
      } else {
        return next(err);
      }
    }

    // auto-login the newly created user
    passport.authenticate('local')(req, res, function() {
      res.redirect('/');
    });
  });
};

exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }

  res.redirect('/login')
}
