"use strict";

var express = require('express');
var app = express();

var blog = require('./blog');
var admin = require('./admin');

app.use('/blog', blog);
app.use('/admin', admin);

app.listen(7777);
