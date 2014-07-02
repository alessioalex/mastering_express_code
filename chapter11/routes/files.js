"use strict";

var express = require('express');
var basicAuth = require('basic-auth-connect');
var errTo = require('errto');
var pkg = require('../package.json');
var File = require('../models/file');
var debug = require('debug')(pkg.name + ':filesRoute');

var router = express.Router();

router.param('id', function(req, res, next, id) {
  File.find(id, errTo(next, function(file) {
    debug('file', file);

    // populate req.file, will need it later
    req.file = file;

    if (file.isPasswordProtected()) {
      // Password protected file, check for password using HTTP basic auth
      basicAuth(function(user, pwd, fn) {
        if (!pwd) { return fn(); }

        // ignore user
        file.authenticate(pwd, errTo(next, function(match) {
          if (match) {
            return fn(null, file.id);
          }

          fn();
        }));
      })(req, res, next);
    } else {
      // Not password protected, proceeed normally
      next();
    }
  }));
});

router.get('/', function(req, res, next) {
  res.render('files/new', { title: 'Upload file' });
});

router.get('/:id.html', function(req, res, next) {
  res.render('files/show', {
    id: req.params.id,
    meta: req.file.meta,
    isPasswordProtected: req.file.isPasswordProtected(),
    title: 'Download file ' + req.file.meta.name
  });
});

router.get('/download/:id', function(req, res, next) {
  res.download(req.file.path, req.file.meta.name);
});

router.post('/', function(req, res, next) {
  var tempFile = req.files.file;
  if (!tempFile.size) { return res.redirect('/files'); }

  var file = new File(tempFile);

  file.save(tempFile.path, req.body.password, errTo(next, function() {
    res.redirect('/files/' + file.id + '.html');
  }));
});

module.exports = router;
