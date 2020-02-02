console.log('- app.js user-library1111');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// authenticate password
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require('bcryptjs');

var mongoose = require('mongoose');


//Import routes
var indexRoutes = require('./routes/indexRoutes.js');
var usersRoutes = require('./routes/userRoutes.js');
 
var catalogRoutes = require('./routes/catalogRoutes.js');

// Hide secret data with nconf
var nconf = require('nconf');
 
nconf.argv().env().file({ file: './user-library1111/config.json' });
 
// console.log('nconf.get: ' + nconf.get("DB_USER"));
// console.log('nconf.get: ' + nconf.get("DB_PASSWORD"));
console.log('nconf.get: ' + nconf.get("DB_URI"));

var app = express();

//Set up mongoose connection
// var dev_db_url = 'mongodb+srv://motrll:mo2389ll@cluster0-m27o8.mongodb.net/local_library3?retryWrites=true';

var dev_db_url = nconf.get("DB_URI");

var mongoDB = process.env.MONGODB_URI || dev_db_url;

var mongoDB = dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// add the middleware libraries into the request handling chain
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded( { extended: false }) );

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// add middleware libraries in request handling chain
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// var indexRouter = require('./routes/index.js');
// var usersRouter = require('./routes/users.js');
// //Import routes for "catalog" area of site
// var catalogRouter = require('./routes/catalog.js');


// routes to use
app.use('/', indexRoutes);
app.use('/users', usersRoutes); //
app.use('/catalog', catalogRoutes); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

console.log('app.js user-library1111');



