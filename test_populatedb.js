#! /usr/bin/env node

console.log('This populates  test books e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

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


var mongoose = require('mongoose');
var mongoDB = userArgs[0];

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true  });

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var books = []
var authors = []
var genres = []

function bookCreate(title, summary, isbn, author, genre, cb) {
  bookdetail = { 
    title: title,
    summary: summary,
    author: author,
    isbn: isbn
  }
  if (genre != false) bookdetail.genre = genre
    
  var book = new Book(bookdetail);    
  book.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Book: ' + book);
    books.push(book)
    cb(null, book)
  }  );
}


function createBooks(cb) {
    async.parallel([
        function(callback) {
          bookCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', 
          'I have stolen ... minstrels weep.', 
          '9781473211896', 
          authors[0], 
          [genres[0],], 
          callback);
        },
        function(callback) {
          bookCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", 
          'Picking up ... pub landlord.', 
          '9788401352836', 
          authors[0], 
          [genres[0],], 
          callback);
        },
        
        ],
        // optional callback
        cb);
}



async.series([
    createBooks
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+bookinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



