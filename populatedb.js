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

function authorCreate(first_name, family_name, d_birth, d_death, cb) {
  authordetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) authordetail.date_of_birth = d_birth
  if (d_death != false) authordetail.date_of_death = d_death
  
  var author = new Author(authordetail);
       
  author.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Author: ' + author);
    //authors.push(author)
    cb(null, author)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    //genres.push(genre)
    cb(null, genre);
  }   );
}

function snesting1(cb) {
  async.series(
      [
        function(callback) {
          authorCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback)
          console.log('serial task 1');
          //callback(null, 'st1');
        },

        function(callback) {
          authorCreate('Ben', 'Bova', '1932-11-8', false, callback);
        
          console.log('serial task 2');
          //callback(null, 'st2');
        }
        
      ],
      function(err, results) {
        console.log('-------- results: '+results);
        //console.log(' .......nesting1 ending...');
        //cb;
        // results is now equal to [1, 2, 3]
      }
    );

}

function snesting2(cb) {
  async.series(
      [
        function(callback) {
          genreCreate("Fantasy", callback);
          console.log('serial task 3');
          //callback(null, 'st3');
        },
        function(callback) {
          genreCreate("Science Fiction", callback);
          console.log('serial task 4');
          //callback(null, 'st4');
        }
        
      ],
      function(err, results) {
        console.log('-------- results: '+results);
        //console.log(' .......nesting2 ending...');
        cb;
        // results is now equal to [1, 2, 3]
      }
    );

}

function pnesting3(callback) {
  async.parallel([
    function(cb) {
      setTimeout(function() {
        console.log('Parallel Task 5 - 400ms');
        cb(null, 'pt5');
      }, 400);
    },
    function(cb) {
      setTimeout(function() {
        console.log('Parallel Task 6 - 200ms');
        cb(null, 'pt6');
      }, 200);
    }
  ],
  function(err, results) {
    console.log('-------- results: '+results);
    //console.log(' ......pnesting3 ending..');
    callback;
    // the results array will equal [1, 2] even though
    // the second function had a shorter timeout.
  });
  
}

function pnesting4(cb) {
  async.parallel([
    function(callback) {
      setTimeout(function() {
        console.log('Parallel Task 7 - 500ms');
        callback(null, 'pt7');
      }, 500);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Parallel Task 8 - 100ms');
        callback(null, 'pt8');
      }, 150);
    }
  ],
  function(err, results) {
    console.log('-------- results: '+results);
    //console.log(' ......pnesting4 ending..');
    cb;
    // the results array will equal [1, 2] even though
    // the second function had a shorter timeout.
  });
}


// main
async.series(
[
  // function(cb) {
  //   snesting1();
  //   console.log('----Serial Nesting 1 Ended ------');
  //   cb(null, 1);
  // },
  snesting1,

  // function(cb) {
  //   snesting2();
  //   console.log('----Serial Nesting 2 Ended ------');
  //   cb(null, 2);
  // },
  snesting2,
  function(cb) {
    pnesting3();
    console.log('----Parallel Nesting 3 Ended ------');
    cb(null, 3);
  },
  function(cb) {
    pnesting4();
    console.log('----Parallel Nesting 4 Ended ------');
    cb(null, 4);
  },
],
function(err, results) {
  console.log('-------- results: '+results);
  // results is now equal to [1, 2, 3]
});

console.log('...........end..................')
console.log('')





//-------------------
