"use strict";

exports.new = function(req, res) {
  res.render('login', { user : req.user });
};

exports.create = function(req, res) {
  res.redirect('/');
};

exports.destroy = function(req, res) {
  req.logout();
  res.redirect('/');
};
