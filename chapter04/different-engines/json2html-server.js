var express = require('express');
var json2html = require('node-json2html').transform;
var app = express();

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
  var data = {
    tag: "p",
    html: function() {
      var str = '';

      if (this) {
        if (this.gender === 'male') {
          str += 'Hello sir ';
        } else {
          str += 'Hello madam ';
        }

        str +=  this.firstName + ' ' + this.lastName;
        return str;
      }
    }
  };

  res.send(json2html(users[parseInt(req.params.index) || 0], data));
});

app.listen(7777);
