require('ejs').filters.toUpper = function(str) { return str.toUpperCase(); }

var express = require('express')
  , cons = require('consolidate')
  , app = express();

// assign the ejs engine to .html files
app.engine('html', cons.ejs);

// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


var users = [{
  firstName: 'John',
  lastName: 'Doe',
  gender: 'male'
}, {
  firstName: 'Jane',
  lastName: 'Doe',
  gender: 'female'
}];

app.get('/users/:index', function(req, res) {
  res.render('index.ejs', {
    user: users[parseInt(req.params.index) || 0]
  });
});

app.listen(7777);
