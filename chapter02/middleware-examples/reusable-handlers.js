"use strict";

var express = require('express');
var app = express();

var articles = {
  'express-tutorial' : {
    title: 'Practical Web Apps with Express',
    content: 'Lean how to create web apps with Express'
  },
  'node-videos': {
    title: 'Node.js video tutorials',
    content: 'Practical Node tips!'
  }
};

var loadArticle = function(req, res, next) {
  if (!articles[req.params.article]) {
    return res.status(404).send('No such article!');
  }

  req.article = articles[req.params.article];

  next();
};

var requireAdmin = function(req, res, next) {
  if (req.ip !== '127.0.0.1') {
    return res.status(403).send('Forbidden');
  }

  next();
};

app.param('article', loadArticle);
app.get('/articles/:article/:action', requireAdmin);

app.get('/articles/:article', function(req, res, next) {
  res.send(req.article.content);
});

app.get('/articles/:article/edit', requireAdmin, function(req, res, next) {
  res.send('Editing article ' + req.article.title);
});

app.listen(7777);
