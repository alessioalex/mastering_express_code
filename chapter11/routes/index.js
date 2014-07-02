"use strict";

var express = require('express');
var router = express.Router();

/* home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'File upload service' });
});

module.exports = router;
