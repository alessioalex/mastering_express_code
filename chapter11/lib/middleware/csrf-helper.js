"use strict";

module.exports = function(req, res, next) {
  res.locals.csrf = function() {
    return "<input type='hidden' name='_csrf' value='" + req.csrfToken() + "' />";
  };

  next();
};
