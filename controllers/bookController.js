console.log('- bookController.js');

// var Book = require('../models/book');

// exports.index = function(req, res) {
//     res.send('NOT IMPLEMENTED: Site Home Page');
// };
// ---- above code replaced by:
var Book = require('../models/book.js');
var Author = require('../models/author.js');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var async = require('async');

const validator = require('express-validator');


exports.counts = function(req, res) {   
    
  async.parallel({
    book_count: function(callback) {
        Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
    },
    book_instance_count: function(callback) {
        BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function(callback) {
        BookInstance.countDocuments({status:'Available'}, callback);
    },
    author_count: function(callback) {
        Author.countDocuments({}, callback);
    },
    genre_count: function(callback) {
        Genre.countDocuments({}, callback);
    }
	}, 
	function(err, results) {
		console.log('> loginRegisterPage.ejs or homeLibraryInventoryView.ejs ');
		(!req.user)?
			
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./layout/homeLibraryInventoryView.ejs', { title: 'HOME - Library Inventory ', error: err, data: results,username: req.user.username  })
			
  });
};


/// Display list of all Books.
exports.book_list = function(req, res, next) {
    console.log('-- bookController.js exports.book_list');
    
    Book.find({}, 'title author')
      .populate('author')
      .exec(function (err, listOfBooks) {
				
				console.log('--- bookController.js exports.book_list Book.exec ');
				
        if (err) { return next(err); }
 
        //var copyListOfBooks = Object.assign({},listOfBooks);
        listOfBooks.sort(function(a, b) {
                           
            let textA = a.title.toUpperCase(); 
            let textB = b.title.toUpperCase(); 
            return (textA < textB) ? -1 :1;
            // return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        
        
        //Successful, so render
        (!req.user)?
					res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
					:
					res.render('./book/bookListView.ejs', { title: 'BOOK LIST', book_list: listOfBooks,username: req.user.username });
				
				console.log('bookController.js exports.book_list Book.exec');

    });
    console.log('bookController.js exports.book_list ');

};



// Display detail page for a specific book.
// exports.book_detail = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
// };
// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
	console.log('-- bookController.js exports.book_detail');
	
	async.parallel({
		book: function(callback) {

			Book.findById(req.params.id)
				.populate('author')
				.populate('genre')
				.exec(callback);

			console.log('> bookController.js async.parallel Book.find.populate.exec');
		},
		book_instance: function(callback) {
			BookInstance.find({ 'book': req.params.id })
			.exec(callback);
			
			console.log('> bookController.js async.parallel Book.find.populate.exec');
		},
	}, 
	function(err, results) {
		if (err) { return next(err); }
		if (results.book==null) { // No results.
				var err = new Error('Book not found');
				err.status = 404;
				return next(err);
        }
        
        var genreNameUrl = [];
        for (let i=0; i< results.book.genre.length; i++) {
           
            let name = results.book.genre[i].name;
            let url = results.book.genre[i].url;
            genreNameUrl[i] = { name: name, url: url };
            console.log(genreNameUrl);
        }

		// Successful, so render.
		(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./book/bookDetailsView.ejs', { title: results.book.title,  book: results.book, book_instances: results.book_instance, username: req.user.username } );
	});
	
	console.log('bookController.js exports.book_detail');
};


// Display book create form on GET.
// exports.book_create_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book create GET');
// };
// Display book create form on GET.
exports.book_create_get = function(req, res, next) { 
	
	console.log('-- bookController.js exports.book_create_get (req,res,next)');
    
	// Get all authors and genres, which we can use for adding to our book.
	async.parallel(
	{
		authors: function(callback) {
				Author.find(callback);
		},
		genres: function(callback) {
				Genre.find(callback);
		},
	}, 
	function(err, results) {
		if (err) { return next(err); }
    let authors2 = Array.from(Object.create(results.authors))
		results.authors.sort(function(a, b) {
			let textA = a.family_name.toUpperCase(); 
			let textB = b.family_name.toUpperCase(); 
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});
		(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./book/bookFormView.ejs', { title: 'CREATE BOOK FORM', authors: results.authors, genres: results.genres, username: req.user.username });
	}
	);
	console.log('bookController.js exports.book_create_get  (req,res,next)');
  
};


// Handle book create on POST.
// exports.book_create_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book create POST');
// };
// Handle book create on POST.
exports.book_create_post = [
	// Convert the genre to an array.
	(req, res, next) => {
		console.log('-- bookController.js exports.book_create_post  f1(req,res,next)');

		if(!(req.body.genre instanceof Array)){
			if(typeof req.body.genre==='undefined')
				req.body.genre=[];
			else
				req.body.genre=new Array(req.body.genre);
		}
		console.log('bookController.js exports.book_create_post  f1(req,res,next)');

		next();
	},

	// Validate fields.
	validator.body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),

	validator.body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),

	validator.body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
	
	validator.body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

	// Sanitize fields (using wildcard).
	validator.sanitizeBody('*').escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		console.log('-- bookController.js exports.book_create_post  f2(req,res,next)');
	
		// Extract the validation errors from a request.
		const errors = validator.validationResult(req);

		// Create a Book object with escaped and trimmed data.
		var book = new Book(
			{ title: req.body.title,
				author: req.body.author,
				summary: req.body.summary,
				isbn: req.body.isbn,
				genre: req.body.genre
				});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.

			// Get all authors and genres for form.
			async.parallel({
				authors: function(callback) {
						Author.find(callback);
				},
				genres: function(callback) {
					Genre.find(callback);
				},

			}, 

			function(err, results) {
				if (err) { return next(err); }

				// Mark our selected genres as checked.
				for (let i = 0; i < results.genres.length; i++) {
					if (book.genre.indexOf(results.genres[i]._id) > -1) {
							results.genres[i].checked='true';
					}
				}
				(!req.user)?
					res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
					:
					res.render('./book/bookFormView.ejs', { title: 'CREATE BOOK FORM',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
			});
			return;
		}
		else {
			// Data from form is valid. Save book.
			book.save(function (err) {
			if (err) { return next(err); }
				//successful - redirect to new book record.
				res.redirect(book.url);
			});
		}
		console.log('bookController.js exports.book_create_post  f2(req,res,next)');

	}
];

// Display book delete form on GET.
// exports.book_delete_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book delete GET');
// };
// Display book delete form on GET.
exports.book_delete_get = function(req, res, next){
  console.log('-- bookController.js exports.book_delete_get');
 
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id).exec(callback)
    },
    book_bookinstances: function(callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback)
    },
  }, 
  function(err, results) {
    if (err) { return next(err); }
    if (results.book==null) { // No results.
        res.redirect('/catalog/books');
    }
    // Successful, so render.
    (!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./book/bookDeleteView.ejs', { title: 'DELETE BOOK', book: results.book, book_bookinstances: results.book_bookinstances, username: req.user.username } );
  });
  console.log('bookController.js exports.book_delete_get');
 
};


// Handle book delete on POST.
// exports.book_delete_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book delete POST');
// };
// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
  console.log('-- bookController.js exports.book_delete_post');
 
  async.parallel({
    book: function(callback) {
      Book.findById(req.body.bookid).exec(callback)
    },
    book_bookinstances: function(callback) {
      BookInstance.find({ 'book': req.body.bookid }).exec(callback)
    },
  }, 
  function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.book_bookinstances.length > 0) {
          // book has bookinstances. Render in same way as for GET route.
          (!req.user)?
						res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
						:
						res.render('./book/bookDeleteView.ejs', { title: 'DELETE BOOK', book: results.book, book_bookinstances: results.book_bookinstances } );
						return;
    }
    else {
      // book has no bookinstances. Delete object and redirect to the list of books.
      Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
          if (err) { return next(err); }
          // Success - go to author list
          res.redirect('/catalog/books')
      })
    }
  });
  console.log('bookController.js exports.book_delete_post');
 
};




// Display book update form on GET.
// exports.book_update_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book update GET');
// };

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
	console.log('-- bookController.js exports.book_update_get')
	// Get book, authors and genres for form.
	async.parallel({
			book: function(callback) {
				Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
			},
			authors: function(callback) {
				Author.find(callback);
			},
			genres: function(callback) {
				Genre.find(callback);
			},
		}, 

		function(err, results) {
			if (err) { return next(err); }
			if (results.book==null) { // No results.
				var err = new Error('Book not found');
				err.status = 404;
				return next(err);
			}
			// Success.
			// Mark our selected genres as checked.
			for (var ag = 0; ag < results.genres.length; ag++) {
				// book belongs to more than 1 genre 
				for (var bg = 0; bg < results.book.genre.length; bg++) {
					if (results.genres[ag]._id.toString()==results.book.genre[bg]._id.toString()) {
						results.genres[ag].checked='true';
					}
				}
			}
			(!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./book/bookFormView.ejs', { title: 'UPDATE BOOK FORM', authors: results.authors, genres: results.genres, book: results.book, username: req.user.username });
		}
	);

};



// Handle book update on POST.
// exports.book_update_post = function(req, res) {
// 	res.send('NOT IMPLEMENTED: Book update POST');
// };

// Handle book update on POST.
exports.book_update_post = [

	// Convert the genre to an array
	(req, res, next) => {
			if(!(req.body.genre instanceof Array)){
					if(typeof req.body.genre==='undefined')
					req.body.genre=[];
					else
					req.body.genre=new Array(req.body.genre);
			}
			next();
	},
 
	// Validate fields.
	validator.body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
	validator.body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
	validator.body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
	validator.body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

	// Sanitize fields.
	validator.sanitizeBody('title').escape(),
	validator.sanitizeBody('author').escape(),
	validator.sanitizeBody('summary').escape(),
	validator.sanitizeBody('isbn').escape(),
	validator.sanitizeBody('genre.*').escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {

			// Extract the validation errors from a request.
			const errors = validator.validationResult(req);

			// Create a Book object with escaped/trimmed data and old id.
			var book = new Book(
				{ title: req.body.title,
					author: req.body.author,
					summary: req.body.summary,
					isbn: req.body.isbn,
					genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
					_id:req.params.id //This is required, or a new ID will be assigned!
				 });

			if (!errors.isEmpty()) {
					// There are errors. Render form again with sanitized values/error messages.

					// Get all authors and genres for form.
					async.parallel({
							authors: function(callback) {
									Author.find(callback);
							},
							genres: function(callback) {
									Genre.find(callback);
							},
					}, function(err, results) {
							if (err) { return next(err); }

							// Mark our selected genres as checked.
							for (let i = 0; i < results.genres.length; i++) {
									if (book.genre.indexOf(results.genres[i]._id) > -1) {
											results.genres[i].checked='true';
									}
							}
							(!req.user)?
								res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
								:
								res.render('./book/bookFormView.ejs', { title: 'UPDATE BOOK FORM',authors: results.authors, genres: results.genres, book: book, errors: errors.array(), username: req.user.username });
					});
					return;
			}
			else {
					// Data from form is valid. Update the record.
					Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
							if (err) { return next(err); }
								 // Successful - redirect to book detail page.
								 res.redirect(thebook.url);
							});
			}
	}
];

console.log('bookController.js');

