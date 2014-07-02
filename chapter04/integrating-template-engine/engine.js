"use strict";

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

exports.cache = {};

exports.getPartials = function(template, currentPath) {
  return template.replace(/<% include (.*) %>/g, function(arg1, filePath) {
    var fullPath = path.resolve(currentPath, filePath);
    var content = fs.readFileSync(fullPath, 'utf8');

    if (/<% include (.*) %>/.test(content)) {
      return exports.getPartials(content, path.dirname(fullPath));
    }

    return content;
  });
};

exports.compileTemplate = function(template, viewsPath) {
  template = exports.getPartials(template, viewsPath);

  return _.template(template);
};

// Render a template with data
exports.render = function(filePath, isCacheEnabled, data) {
  var layoutPath, compiledFn;

  if (!isCacheEnabled || (isCacheEnabled && !exports.cache[filePath])) {
    var content = fs.readFileSync(filePath, 'utf8').replace(/<% extends (.*) %>/, function(arg1, p) {
      layoutPath = path.resolve(data.settings.views, p);
      return '';
    });

    if (layoutPath) {
      content = fs.readFileSync(layoutPath, 'utf8').replace('<% body %>', content);
    }

    // compile template
    content = exports.compileTemplate(content, data.settings.views);
    compiledFn = content;

    // cache the compiled template if caching enabled
    if (isCacheEnabled && !exports.cache[filePath]) {
      exports.cache[filePath] = content;
    }
  } else {
    // compiled function can be found in cache
    compiledFn = exports.cache[filePath];
  }

  // evaluate the compiled function
  return compiledFn(data || {});
};

exports.renderFile = function(filePath, data, callback) {
  var isCacheEnabled = !!data.settings['view cache'];

  try {
    var tmpl = exports.render(filePath, isCacheEnabled, data);
    return setImmediate(callback.bind(null, null, tmpl));
  }
  catch(err) {
    return setImmediate(callback.bind(null, err));
  }
};
