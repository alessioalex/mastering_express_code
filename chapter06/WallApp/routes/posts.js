"use strict";

var errTo = require('errto');
var niceErr = require('nice-error');

exports.index = function(req, res, next) {
  var opts = {};
  var tpl = 'index';

  if (req.query.partial) {
    opts.older = req.query.older;
    tpl = '_posts';
  }

  req.Post.getWith(opts, errTo(next, function(posts) {
    res.render(tpl, {
      posts: posts,
      user: req.user,
      successMsg: req.flash('success')[0],
      errorMsg: req.flash('error')[0]
    });
  }));
};

exports.create = function(req, res, next) {
  var post = new req.Post({
    content: req.body.content,
    author: req.user._id
  });

  post.save(function(err) {
    if (err) {
      if (err.name === 'ValidationError') {
        req.flash('error', 'Could not publish the post, please make sure it has a length of 2-255 chars');
      } else {
        return next(err);
      }
    } else {
      req.flash('success', 'Successfully published the post');
      // creating another var so we can populate the author details
      var _post = {
        _id: post._id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          username: req.user.username,
          email: req.user.email
        }
      };

      res.render('_posts', {
        posts: [_post]
      }, function(err, content) {
        if (!err) {
          // Note: this works fine for a single process, but when having
          // more processes a message bus (like Redis for example) is needed
          // (to listen for new events emitted by different processes and
          // broadcast them to the clients)
          return req.broadcast(content);
        }
        console.error(niceErr(err));
      });
    }

    res.redirect('/');
  });
};
