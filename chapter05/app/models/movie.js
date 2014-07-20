"use strict";

var mdb = require('moviedb');

function Movie(API_KEY) {
  if (!API_KEY) { throw new Error('API_KEY is required'); }

  this.client = mdb(API_KEY);
  this.imagesPath = '';
  this.posterSizes = '';
}

Movie.prototype.getConfiguration = function(callback) {
  var that = this;

  if (!this.imagesPath) {
    this.client.configuration(function(err, config) {
      if (err) { return callback(err); }

      that.imagesPath = config.images.base_url;
      that.posterSizes = config.images.poster_sizes;

      callback();
    });
  } else {
    process.nextTick(callback);
  }
};

Movie.prototype.getFullImagePath = function(relativePath, size) {
  if (!relativePath) { return ''; }

  if (!size) {
    // default to smalles size
    size = this.posterSizes[0];
  } else {
    var index = this.posterSizes.indexOf(size);
    size = this.posterSizes[index];

    if (!size) {
      throw new Error('unknown image size');
    }
  }

  return this.imagesPath + size + relativePath;
};

Movie.prototype.search = function(title, callback) {
  var that = this;

  this.getConfiguration(function(err) {
    if (err) { return callback(err); }

    that.client.searchMovie({ query: title }, function(err, movies) {
      if (err) { return callback(err); }

      // convert relative to full path
      movies.results.forEach(function(movie) {
        movie.poster_path = that.getFullImagePath(movie.poster_path);
      });

      callback(null, movies);
    });
  });
};

Movie.prototype.getMovie = function(id, callback) {
  var that = this;

  this.client.movieInfo({ id: id }, function(err, info) {
    if (err) { return callback(err); }

    var movieInfo = info;
    var cast = {};
    var trailers = {};

    var doneCalled = false;
    var tasksCount = 2;
    var done = function(err) {
      if (doneCalled) { return; }

      if (err) {
        doneCalled = true;
        return callback(err);
      };

      tasksCount--;

      if (tasksCount === 0) {
        movieInfo.trailers = trailers;
        movieInfo.cast = cast;

        callback(null, movieInfo);
      }
    };

    that.client.movieTrailers({ id: id }, function(err, trailerData) {
      if (err) { return done(err); }

      trailers = trailerData;

      done();
    });

    that.client.movieCredits({ id: id }, function(err, credits) {
      var called = false;

      var cb = function(err) {
        if (called) { return; }

        if (err) {
          called = true;
          return done(err);
        };

        count--;

        if (count === 0) {
          that.getConfiguration(function(err) {
            if (err) { return done(err); }

            movieInfo.poster_path = that.getFullImagePath(movieInfo.poster_path, 'w185');

            done();
          });
        }
      };

      if (err) { return cb(err); }

      var count = credits.cast.length;

      cast = credits.cast;

      credits.cast.forEach(function(person) {
        that.client.personInfo({ id: person.id }, function(err, personInfo) {
          if (err) { return cb(err); }

          // extend person with details
          person.details = personInfo;
          that.getConfiguration(function(err) {
            if (err) { return cb(err); }

            person.details.profile_path = that.getFullImagePath(person.details.profile_path);
            cb();
          });
        });
      });
    });
  });
};

module.exports = Movie;
