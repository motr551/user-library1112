console.log('- genreController.js');

var Genre = require('../models/genre');
var Book = require('../models/book'); 
var async = require('async');
const validator = require('express-validator');


// Display list of all Genre.
// exports.genre_list = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre list');
// };

exports.genre_list = function(req, res) {
    
    
    Genre.find().sort([['name', 'ascending']]).exec( (err, genreList ) => {
			console.log('-- genreController.js exports.genre_list Genre.find().populate(_).exec(_');

			if (err) { return next(err); }

			// succesfully received genre list
			(!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./genre/genre_list.ejs', {title: 'GENRE LIST', genre_list: genreList, username: req.user.username });

			console.log('genreController.js exports.genre_list Genre.find().populate(_).exec(_');

    })
};

// Display detail page for a specific Genre.
// exports.genre_detail = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
// };
// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

	async.parallel({
			genre: function(callback) {
				Genre.findById(req.params.id)
					.exec(callback);
					
				console.log('>genre_detail genre:');
			},

			genre_books: function(callback) {
					Book.find({ 'genre': req.params.id })
					.exec(callback);
					
					console.log('>genre_detail genre_books:');
			},
		}, 
		function(err, results) {
			console.log('-- genreController.js async.parallel');

			if (err) { return next(err); }
			if (results.genre==null) { // No results.
					var err = new Error('Genre not found');
					err.status = 404;
					return next(err);
			}
			for (i=0; i<results.genre_books.length;i++) {
				let url = results.genre_books[i].url;
				let summary = results.genre_books[i].summary;
			}


			// Successful, so render
			(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./genre/genre_detail.ejs', {  genre: results.genre, genre_books: results.genre_books, username: req.user.username } );
		}
	);
	
	console.log('genreController.js async.parallel');
		
};

// 
// Display Genre create form on GET.
// exports.genre_create_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre create GET');
// };
// Display Genre create form on GET. 
exports.genre_create_get = function(req, res, next) { 
	console.log('-- genreController.js export.grenre_create_get');

	(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./genre/genre_form.ejs', { title: 'CREATE GENRE FORM', username: req.user.username }); 

	console.log('genreController.js export.grenre_create_get');

};


// Handle Genre create on POST.
// exports.genre_create_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre create POST');
// };
// Handle Genre create on POST.
exports.genre_create_post =  [
   
  // Validate that the name field is not empty.
  validator.body('name', 'Genre name required').isLength({ min: 1 }).trim(),
  
  // Sanitize (escape) the name field.
  validator.sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
		console.log('-- genreController.js export.grenre_create_post function');

    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      { name: req.body.name }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      (!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./genre/genre_form.ejs', { title: 'CREATE GENRE FORM', genre: genre, errors: errors.array(), username: req.user.username});
      return;
    }
    else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ 'name': req.body.name })
        .exec( function(err, found_genre) {
					if (err) { return next(err); }

					if (found_genre) {
						// Genre exists, redirect to its detail page.
						res.redirect(found_genre.url);
					}
					else {

						genre.save(function (err) {
							if (err) { return next(err); }
							// Genre saved. Redirect to genre detail page.
							res.redirect(genre.url);
						});

					}

        });
		}
		
		console.log('genreController.js export.grenre_create_post function');

  }
];

// Display Genre delete form on GET.
// exports.genre_delete_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre delete GET');
// };
// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next){
	console.log('-- genreController.js exports.genre_delete_get');

	async.parallel({
		genre: function(callback) {
			Genre.findById(req.params.id).exec(callback)
		},
		genres_books: function(callback) {
			Book.find({ 'genre': req.params.id }).exec(callback)
		},
	}, 
	function(err, results) {
		if (err) { return next(err); }
		if (results.genre==null) { // No results.
				res.redirect('/catalog/genre');
		}
		// Successful, so render.
		(!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./genre/genre_delete.ejs', { title: 'DELETE GENRE', genre: results.genre, genres_books: results.genres_books, username: req.user.username } );
	});
	console.log('genreController.js exports.genre_delete_get');

};

// Handle Genre delete on POST.
// exports.genre_delete_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre delete POST');
// };
// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
	console.log('-- genreController.js exports.genre_delete_post');

	async.parallel({
		genre: function(callback) {
			Genre.findById(req.body.genreid).exec(callback)
		},
		genres_books: function(callback) {
			Book.find({ 'genre': req.body.genreid }).exec(callback)
		},
	}, 
	function(err, results) {
			if (err) { return next(err); }
			// Success
			if (results.genres_books.length > 0) {
					// Genre has books. Render in same way as for GET route.
					(!req.user)?
						res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
						:
						res.render('./genre/genre_delete.ejs', { title: 'DELETE GENRE', genre: results.genre, genres_books: results.genres_books, username: req.user.username } );
			return;
		}
		else {
			// Genre has no books. Delete object and redirect to the list of authors.
			Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
					if (err) { return next(err); }
					// Success - go to author list
					res.redirect('/catalog/genres')
			})
		}
	});
	console.log('genreController.js exports.genre_delete_post');

};

// Display Genre update form on GET.
// exports.genre_update_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre update GET');
// };
// Display genre update form on GET.
exports.genre_update_get = function(req, res, next) 
{
  console.log('-- genreController.js exports.genre_update_get');
  
  // Get genre for form.
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      
    }, 
 
    function(err, results) {
      if (err) { return next(err); }
      if (results.genre==null) { // No results.
        var err = new Error('genre not found');
        err.status = 404;
        return next(err);
      }
           
      (!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./genre/genre_form.ejs', { title: 'UPDATE GENRE FORM', genre: results.genre, username: req.user.username });
    }
  );
 
};



// Handle Genre update on POST.
// exports.genre_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Genre update POST');
// };
// Handle genre update on POST.
exports.genre_update_post = [
 
	// Validate that the name field is not empty.
	validator.body('name', 'Genre name required').isLength({ min: 1 }).trim(),
	
	// Sanitize (escape) the name field.
	validator.sanitizeBody('name').escape(),
	
	
	// Process request after validation and sanitization.
	(req, res, next) => {
		console.log('-- genreController.js exports.genre_update_post (req,res,next');

		// Extract the validation errors from a request.
		const errors = validator.validationResult(req);

		// Create a genre object with escaped/trimmed data and old id.
		var genre = new Genre(
			{ name: req.body.name,
				_id: req.params.id
		});

		if (!errors.isEmpty()) {
				
			(!req.user)?
				res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
				:
				res.render('./genre/genre_form.ejs', { title: 'UPDATE GENRE FORM', genre: req.body, errors: errors.array(), username: req.user.username });
	
			return;
		}
		else {
			// Data from form is valid. Update the record.
			Genre.findByIdAndUpdate(req.params.id, genre, {}, 	function (err,thegenre) {
				if (err) { return next(err); }
					// Successful - redirect to genre detail page.
					res.redirect(thegenre.url);
			});
		}
		console.log('genreController.js exports.genre_update_post (req,res,next');
	}
	
 ];
 

//console.log('genreController.js');
