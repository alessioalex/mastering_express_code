"use strict";

var mdb = require('moviedb');
var errTo = require('errto');
var after = require('after');
var series = require('async-series');
var xtend = require('xtend');

function Movie(API_KEY) {
  if (!API_KEY) { throw new Error('API_KEY is required'); }

  this.client = mdb(API_KEY);
  this.imagesPath = '';
  this.posterSizes = '';
}

Movie.prototype.getConfiguration = function(callback) {
  var that = this;

  if (!this.imagesPath) {
    this.client.configuration(errTo(callback, function(config) {
      that.imagesPath = config.images.base_url;
      that.posterSizes = config.images.poster_sizes;

      callback();
    }));
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
  var movies = {};

  series([
    function(next) {
      that.getConfiguration(next);
    },
    function(next) {
      that.client.searchMovie({ query: title }, errTo(next, function(mov) {
        // convert relative to full path
        mov.results.forEach(function(movie) {
          movie.poster_path = that.getFullImagePath(movie.poster_path);
        });

        movies = mov;

        next();
      }));
    }
  ], errTo(callback, function() {
    callback(null, movies);
  }));
};

Movie.prototype.getMovie = function(id, callback) {
  var that = this;

  this.client.movieInfo({ id: id }, errTo(callback, function(info) {
    var movieInfo = info;
    var cast = {};
    var trailers = {};

    var done = after(2, errTo(callback, function() {
      movieInfo = xtend(movieInfo, {
        trailers: trailers,
        cast: cast
      });

      callback(null, movieInfo);
    }));

    that.client.movieTrailers({ id: id }, errTo(done, function(trailerData) {
      trailers = trailerData;

      done();
    }));

    that.client.movieCredits({ id: id }, errTo(done, function(credits) {
      var next = after(credits.cast.length, errTo(done, function(err) {
        that.getConfiguration(errTo(done, function() {
          movieInfo.poster_path = that.getFullImagePath(movieInfo.poster_path, 'w185');

          done();
        }));
      }));

      cast = credits.cast;

      credits.cast.forEach(function(person) {
        that.client.personInfo({ id: person.id }, errTo(next, function(personInfo) {
          // extend person with details
          person.details = personInfo;

          that.getConfiguration(errTo(next, function() {
            person.details.profile_path = that.getFullImagePath(person.details.profile_path);
            next();
          }));
        }));
      });
    }));
  }));
};

module.exports = Movie;
