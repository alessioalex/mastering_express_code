"use strict";

var errTo = require('errto');
var Err = require('custom-err');

exports.search = function(req, res, next) {
  res.render('search', {
    pageTitle: 'Search for movies'
  });
};

exports.index = function(req, res, next) {
  if (!req.query.title) {
    return next(Err('Missing search param', { code: 422 }));
  }

  req.movie.search(req.query.title, errTo(next, function(movies) {
    res.render('movies', {
      pageTitle: 'Search results for ' + req.query.title,
      movies: movies
    });
  }));
};

exports.show = function(req, res, next) {
  if (!/^\d+$/.test(req.params.id)) {
    return next(Err('Bad movie id', { code: 422 }));
  }

  req.movie.getMovie(req.params.id, errTo(next, function(movie) {
    res.render('movie', {
      pageTitle: movie.title,
      movie: movie
    });
  }));
};
