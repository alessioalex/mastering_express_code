"use strict";

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var stackTrace = require('stack-trace');
var asyncEach = require('async-each');
var hljs = require('highlight.js');
var sep = require('path').sep;
var ejs = require('ejs');

var renderTmpl = ejs.compile(fs.readFileSync(__dirname + '/public/template.html', 'utf8'));

var hljsStyle = fs.readFileSync(__dirname + '/public/style.css', 'utf8');
var mainJs = fs.readFileSync(__dirname + '/public/main.js', 'utf8');

hljs.configure({
  tabReplace: '  ',
  lineNodes: true
});

function displayDetails(err, req, res, next) {
  var stack = stackTrace.parse(err);
  var fileIndex = 1;

  console.error(err.stack);

  asyncEach(stack, function getContentInfo(item, cb) {
    // exclude core node modules and node modules
    if ((item.fileName.indexOf(sep) !== -1) && !/node_modules/.test(item.fileName)) {
      fs.readFile(item.fileName, 'utf-8', function(err, content) {
        if (err) { return cb(err); }

        content = hljs.getHighlighted(content, 'javascript').innerHTML;

        // start a few lines before the error or at the beginning of the file
        var start = Math.max(item.lineNumber - 5, 0);
        var lines = content.split('\n');
        // end a few lines after the error or the last line of the file
        var end = Math.min(item.lineNumber + 4, lines.length);
        var snippet = lines.slice(start, end);
        // array starts at 0 but lines numbers begin with 1, so we have to
        // subtract 1 to get the error line position in the array
        var errLine = item.lineNumber - start - 1;

        snippet[errLine] = snippet[errLine].replace('<span class="line">', '<span class="line error-line">');

        item.content = snippet.join('\n');
        item.errLine = errLine;
        item.startLine = start;
        item.id = 'file-' + fileIndex;

        fileIndex++;

        cb(null, item);
      });
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

    res.send(renderTmpl({
      hljsStyle: hljsStyle,
      mainJs: mainJs,
      err: err,
      items: items
    }));
  });
}

var editorCmd = '/Users/alexandruvladutu/bin/dotfiles/MacVim/mvim';

function openEditor(req, res, next) {
  var file = '/' + req.params[0];

  exec(editorCmd + ' ' + file, function(err) {
    if (!err) {
      res.send('The file should open in your editor now: <br /> ' + file);
    } else {
      res.status(500).send(err.message);
    }
  });
}

module.exports = {
  displayDetails: displayDetails,
  openEditor: openEditor
};
