var express = require('express')
  , cons = require('consolidate')
  , app = express();

// assign the jade engine to .html files
app.engine('html', cons.jade);

// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

var getSalutation = function() {
  return (this.gender === 'male') ? 'Hello sir' : 'Hello madam';
};
var getFullName = function() {
  return this.firstName + ' ' + this.lastName;
};

var users = [{
  firstName: 'John',
  lastName: 'Doe',
  gender: 'male'
}, {
  firstName: 'Jane',
  lastName: 'Doe',
  gender: 'female'
}];

app.get('/users/:index', function(req, res){
  res.render('index-jade.jade', {
    user: users[parseInt(req.params.index) || 0],
    salutation: getSalutation,
    name: getFullName
  });
});

app.listen(7777);
