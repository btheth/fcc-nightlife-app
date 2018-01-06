'use strict';

var express = require('express');
var routes = require('./app/routes/main.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var logger = require('morgan');
var flash = require('connect-flash');
var bodyParser = require('body-parser');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
require('dotenv').load();
require('./app/config/passport')(passport);

//start up mongo
var MONGO_URI = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS;
MONGO_URI += '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
mongoose.connect(MONGO_URI);
mongoose.Promise = global.Promise;

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/node', express.static(process.cwd() + '/node_modules/jquery.cookie'));

app.use(session({
	secret: 'nightlife-app',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

routes(app,passport);

//var port = process.env.PORT || 8080;
app.listen(process.env.PORT,  function () {
	console.log('Node.js listening on port ' + port + '...');
});