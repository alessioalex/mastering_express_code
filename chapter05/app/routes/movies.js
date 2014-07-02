"use strict";

exports.search = function(req, res, next) {
  res.render('search', {
    pageTitle: 'Search for movies'
  });
};

exports.index = function(req, res, next) {
  if (!req.query.title) {
    var err = new Error('Missing search param');
    err.code = 422;
    return next(err);
  }

  req.movie.search(req.query.title, function(err, movies) {
    if (err) { return next(err); }

    res.render('movies', {
      pageTitle: 'Search results for ' + req.query.title,
      movies: movies
    });
  });
};

exports.show = function(req, res, next) {
  if (!/^\d+$/.test(req.params.id)) {
    var err = new Error('Bad movie id');
    err.code = 422;
    return next(err);
  }

  req.movie.getMovie(req.params.id, function(err, movie) {
    if (err) { return next(err); }

    res.render('movie', {
      pageTitle: movie.title,
      movie: movie
    });
  });
};
