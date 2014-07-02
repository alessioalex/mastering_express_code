"use strict";

var express = require('express');
var _ = require('lodash');
var db = require('../lib/db');

exports.index = function(req, res, next) {
  req.Note.find({ userId: req.user._id }, function(err, notes) {
    if (err) { return next(err); }

    res.send(notes);
  });
};

exports.show = function(req, res, next) {
  req.Note.findOne({ _id: req.params.id, userId: req.user._id }, function(err, note) {
    if (err) { return next(err); }

    res.send(note);
  });
};

exports.create = function(req, res, next) {
  var note = new req.Note(_.pick(req.body, ['title', 'description', 'rating', 'category', 'public']));
  note.userId = req.user._id;

  note.save(function(err, noteData) {
    if (err) {
      if (db.isValidationError(err)) {
        res.status(422).send({ errors: ['invalid data'] });
      } else {
        next(err);
      }
    } else {
      res
        .status(201)
        .set('Location', '/notes/' + noteData._id)
        .send(noteData);
    }
  });
};

exports.showPublic = function(req, res, next) {
  req.User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }

    if (!user) { return res.status(404).send({ errors: ['no such user'] })};

    req.Note.find({ userId: user._id, public: true }, function(err, notes) {
      if (err) { return next(err); }

      res.send(notes);
    });
  });
};
