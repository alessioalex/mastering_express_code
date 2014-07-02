var express = require('express');
var ejs = require('ejs');
var app = express();

// assign the ejs engine to .html files
app.engine('html', ejs.renderFile);

// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/search', function(req, res, next) {
  res.render('search');
});

app.listen(7777);
