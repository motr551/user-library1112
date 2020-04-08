#! /usr/bin/env node

console.log('script populates books, authors, genres and bookinstances to  database. database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Book = require('./models/book')
var Author = require('./models/author')
var Genre = require('./models/genre')
var BookInstance = require('./models/bookinstance')


var mongoose = require('mongoose');
// var mongoDB = userArgs[0];
var mongoDB  = 'mongodb+srv://motrll:mo2389ll@cluster0-m27o8.mongodb.net/populatedb01?retryWrites=true';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true  });

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//==================

function snesting1(callback2) {
  async.series(
      [
        function(callback3) {
          console.log('serial task 1');
          callback3(null, 'st1');
        },
        function(callback3) {
          console.log('serial task 2');
          callback3(null, 'st2');
        }
        
      ],
      function(err, results) {
        console.log(results);
        console.log(' .......nesting1 ending...');
        callback2;
        // results is now equal to [1, 2, 3]
      }
    );

}

function snesting2(callback2) {
  async.series(
      [
        function(callback3) {
          
          console.log('serial task 3');
          callback3(null, 'st3');
        },
        function(callback3) {
          console.log('serial task 4');
          callback3(null, 'st4');
        }
        
      ],
      function(err, results) {
        console.log(results);
        console.log(' .......nesting2 ending...');
        callback2;
        // results is now equal to [1, 2, 3]
      }
    );

}

function pnesting3(callback2) {
  async.parallel([
    function(callback3) {
      setTimeout(function() {
        console.log('Parallel Task 5 - 400ms');
        callback3(null, 'pt5');
      }, 400);
    },
    function(callback3) {
      setTimeout(function() {
        console.log('Parallel Task 6 - 200ms');
        callback3(null, 'pt6');
      }, 200);
    }
  ],
  function(err, results) {
    console.log(results);
    console.log(' ......pnesting3 ending..');
    callback2;
    // the results array will equal [1, 2] even though
    // the second function had a shorter timeout.
  });
}

function pnesting4(callback2) {
  async.parallel([
    function(callback3) {
      setTimeout(function() {
        console.log('Parallel Task 7 - 500ms');
        callback3(null, 'pt7');
      }, 500);
    },
    function(callback3) {
      setTimeout(function() {
        console.log('Parallel Task 8 - 100ms');
        callback3(null, 'pt8');
      }, 150);
    }
  ],
  function(err, results) {
    console.log(results);
    console.log(' ......pnesting4 ending..');
    callback2;
    // the results array will equal [1, 2] even though
    // the second function had a shorter timeout.
  });
}


// main
async.series(
[
  function(callback1) {
    snesting1();
    console.log('----Serial Nesting 1 Ended ------');
    callback1(null, 1);
  },
  function(callback1) {
    snesting2();
    console.log('----Serial Nesting 2 Ended ------');
    callback1(null, 2);
  },
  function(callback1) {
    pnesting3();
    console.log('----Parallel Nesting 3 Ended ------');
    callback1(null, 3);
  },
  function(callback1) {
    pnesting4();
    console.log('----Parallel Nesting 4 Ended ------');
    callback1(null, 4);
  },
],
function(err, results) {
  console.log(results);
  // results is now equal to [1, 2, 3]
});

console.log('...........end..................')
console.log('................................')





//-------------------
