console.log('- authorController.js');

var Author = require('../models/author.js');
var Book	= require('../models/book.js');
var async = require('async');

const validator = require('express-validator');

// Display list of all Authors.
// exports.author_list = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author list');
// };
exports.author_list = function(req, res, next) {

	Author.find()
	.sort([['family_name', 'ascending']])
	.exec(function (err, authorList) {
		console.log('- authorController.js author.find.sort.exec');

		if (err) { return next(err); }
		//Successful, so render
		(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./author/author_list.ejs', { title: 'AUTHOR LIST', author_list: authorList, username: req.user.username 
		});
		
		console.log('authorController.js author.find.sort.exec');

	});
  
};

// Display detail page for a specific Author.
// exports.author_detail = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
// };
exports.author_detail = function(req, res, next) {

	async.parallel( 
		{ author: 
						function(callback) {
								Author.findById(req.params.id)
								.exec(callback) 
						}, 
			authors_books: 
						function(callback) {
							Book.find({ 'author': req.params.id },'title summary')
							.exec(callback) 
						} 
		}, 
		function(err, results) {
			if (err) { return next(err); } // Error in API usage.
			if (results.author==null) { // No results.
				var err = new Error('Author not found');
				err.status = 404;
				return next(err);
			}
			// Successful, so render.
			(!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./author/author_detail.ejs', { title: 'AUTHOR DETAIL', author: results.author, author_books: results.authors_books, username: req.user.username });
			
			console.log('authorController.js exports.author.detail function(err,results)');

		} 
	);

};

// Display Author create form on GET.
// exports.author_create_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author create GET');
// };
// Display Author create form on GET. 
exports.author_create_get = function(req, res, next) {
	console.log('-- authorController.js author_create_get');
	
	(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./author/author_form.ejs', { title: 'CREATE AUTHOR FORM', username: req.user.username}); 

	console.log('authorController.js author_create_get');

};
 


// Handle Author create on POST.
// exports.author_create_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author create POST');
// };
// Handle Author create on POST.
exports.author_create_post = [
	// console.log('-- authorController.js exports.author_create_post'),

	// Validate fields.
	validator.body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
		.isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),

	validator.body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
		.isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

	validator.body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

	validator.body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

	// Sanitize fields.
	validator.sanitizeBody('first_name').escape(),
	validator.sanitizeBody('family_name').escape(),
	validator.sanitizeBody('date_of_birth').toDate(),
	validator.sanitizeBody('date_of_death').toDate(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		console.log('-- authorController.js exports.author_create_post (req,res,next');

		// Extract the validation errors from a request.
		const errors = validator.validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			(!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./author/author_form.ejs', { title: 'CREATE AUTHOR FORM', author: req.body, errors: errors.array(), username: req.user.username });
			return;
		}
		else {
			// Data from form is valid.

			// Create an Author object with escaped and trimmed data.
			var author = new Author(
			{
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death
			});

			author.save(function (err) {
				if (err) { return next(err); }
				// Successful - redirect to new author record.
				res.redirect(author.url);
			});
		}
		console.log('authorController.js exports.author_create_post (req,res,next');
	
	}


];

// Display Author delete form on GET.
// exports.author_delete_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author delete GET');
// };
// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
	console.log('-- authorController.js exports.author_delete_get');

	async.parallel({
		author: function(callback) {
				Author.findById(req.params.id).exec(callback)
		},
		authors_books: function(callback) {
			Book.find({ 'author': req.params.id }).exec(callback)
		},
	}, 
	function(err, results) {
		if (err) { return next(err); }
		if (results.author==null) { // No results.
				res.redirect('/catalog/authors');
		}
		// Successful, so render.
		(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
			:
			res.render('./author/author_delete.ejs', { title: 'DELETE AUTHOR: ', author: results.author, author_books: results.authors_books, username: req.user.username } );
	});
	console.log('authorController.js exports.author_delete_get');

};


// Handle Author delete on POST.
// exports.author_delete_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author delete POST');
// };
// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
	console.log('-- authorController.js exports.author_delete_post');

	async.parallel({
		author: function(callback) {
			Author.findById(req.body.authorid).exec(callback)
		},
		authors_books: function(callback) {
			Book.find({ 'author': req.body.authorid }).exec(callback)
		},
	}, 
	function(err, results) {
			if (err) { return next(err); }
			// Success
			if (results.authors_books.length > 0) {
					// Author has books. Render in same way as for GET route.
					(!req.user)?
						res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
						:
						res.render('./author/author_delete.ejs', { title: 'DELETE AUTHOR: ', author: results.author, author_books: results.authors_books, username: req.user.username } );
			return;
		}
		else {
			// Author has no books. Delete object and redirect to the list of authors.
			Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
					if (err) { return next(err); }
					// Success - go to author list
					res.redirect('/catalog/authors')
			})
		}
	});
	console.log('authorController.js exports.author_delete_post');

};

// Display Author update form on GET.
// exports.author_update_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author update GET');
// };
// Display author update form on GET.
exports.author_update_get = function(req, res, next) 
{
  console.log('-- authorController.js exports.author_update_get');
  
  // Get author for form.
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      
    }, 
 
    function(err, results) {
      if (err) { return next(err); }
      if (results.author==null) { // No results.
        var err = new Error('author not found');
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark the selected book as selected.
      // for (var i = 0; i < results.books.length; i++) {
      //    if (results.books[i]._id.toString()==results.bookinstance.book._id.toString()) {
 
      //   results.books[i].checked='true';
      //    }
      //  }
      
      (!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./author/author_form.ejs', { title: 'UPDATE AUTHOR FORM', author: results.author, username: req.user.username });
    }
  );
 
};


// Handle Author update on POST.
// exports.author_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author update POST');
// };
exports.author_update_post = [
 
  
 
  // Validate fields.
	validator.body('first_name','First name must be specified.').isLength({ min: 1 }).trim()
	.isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),

validator.body('family_name','Family name must be specified.').isLength({ min: 1 }).trim()
	.isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

validator.body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

validator.body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
 
  // Sanitize fields.
  validator.sanitizeBody('first_name').escape(),
  validator.sanitizeBody('family_name').escape(),
  validator.sanitizeBody('date_of_birth').toDate(),
  validator.sanitizeBody('date_of_death').toDate(),
 
 
  // Process request after validation and sanitization.
  (req, res, next) => {
		console.log('-- authorController.js exports.author_update_post (req,res,next');

		// Extract the validation errors from a request.
		const errors = validator.validationResult(req);

		// Create a author object with escaped/trimmed data and old id.
		var author = new Author(
			{ first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death,
				_id: req.params.id
				});

		if (!errors.isEmpty()) {
				// There are errors. Render form again with sanitized values/error messages.

				// Get all authors and genres for form.
				// async.parallel({
				//     author: function(callback) {
				//         Author.find(callback);
				//     },
				//     }, function(err, results) {
				//     if (err) { return next(err); }

						// Mark our selected book as selected.
						//for (let i = 0; i < results.books.length; i++) {
						//    if (bookinstance.book.indexOf(results.books[i]._id) > -1) {
						//        results.books[i].checked='true';
						//    }
						//}
						(!req.user)?
							res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
							:
							res.render('./author/author_form.ejs', { title: 'UPDATE AUTHOR FORM', author: req.body, errors: errors.array(), username: req.user.username });
				
				return;
		}
		else {
				// Data from form is valid. Update the record.
				Author.findByIdAndUpdate(req.params.id, author, {}, function (err,theauthor) {
						if (err) { return next(err); }
								// Successful - redirect to author detail page.
								res.redirect(theauthor.url);
						});
		}
		console.log('authorController.js exports.author_update_post (req,res,next');
	}
	
];

console.log('authorController.js');

