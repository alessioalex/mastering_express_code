"use strict";

var fs = require('fs');
var stackTrace = require('stack-trace');
var asyncEach = require('async-each');
var errTo = require('errto');
var niceErr = require('nice-error');

function handleErrors(err, req, res, next) {
  var stack = stackTrace.parse(err);

  console.error(niceErr(err));

  asyncEach(stack, function getContentInfo(item, cb) {
    // exclude core node modules and node modules
    if (/\//.test(item.fileName) && !/node_modules/.test(item.fileName)) {
      fs.readFile(item.fileName, 'utf-8', errTo(cb, function(content) {
        var start = item.lineNumber - 5;
        if (start < 0) { start = 0; }
        var end = item.lineNumber + 4;
        var snippet = content.split('\n').slice(start, end);
        // decorate the error line
        snippet[snippet.length - 5] = '<strong>' + snippet[snippet.length - 5] + '</strong>';
        item.content = snippet.join('\n');

        cb(null, item);
      }));
    } else {
      cb();
    }
  }, function(e, items) {
    items = items.filter(function(item) { return !!item; });

    // if something bad happened while processing the stacktrace
    // make sure to return something useful
    if (e) {
      console.error(e);

      return res.send(err.stack);
    }

    var html = '<h1>' + err.message + '</h1><ul>';

    items.forEach(function(item) {
      html += '<li>at ' + item.functionName || 'anonymous';
      html += ' (' + item.fileName + ':' + item.lineNumber + ':' + item.columnNumber + ')';
      html += '<p><pre><code>' + item.content + '</code></pre><p>';
      html += '</li>';
    });

    html += '</ul>';

    res.send(html);
  });
}

module.exports = handleErrors;
