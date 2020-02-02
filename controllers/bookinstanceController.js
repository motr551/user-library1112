console.log('- bookinstanceControllerjs');

var BookInstance = require('../models/bookinstance.js');

const validator = require('express-validator');

var Book = require('../models/book.js');

var async = require('async');


// Display list of all BookInstances.
// exports.bookinstance_list = function(req, res) {
//     res.send('NOT IMPLEMENTED: BookInstance list');
// };
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
  console.log('-- bookinstanceController.js exports.bookinstance_list')
  
  BookInstance.find().populate('book')
    .exec(function (err, list_bookinstances) {
    if (err) { return next(err); }
    // Successful, so render
    (!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./bookcopy/bookinstance_list', { title: 'BOOK INSTANCE LIST', bookinstance_list: list_bookinstances, username: req.user.username });
  });
  
  console.log('bookinstanceController.js exports.bookinstance_list')
    
};


function formatDate(date) {
  let monthNames = [
    "Jan", "Feb", "Mar","Apr",
    "May", "Jun", "Jul","Aug",
    "Sep", "Oct","Nov","Dec"
  ];
  let wkDays = [
    "Mo",'Tu','We','Th','Fr','Sa','Su'
  ]
  let wkDayNo = date.getDay();  // Mo =1 Sun =7
  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();

  return wkDays[wkDayNo-1]+' '+ day + ' ' + monthNames[monthIndex] + ' ' + year;
}

// let dueBackDate = formatDate(new Date());


// Display detail page for a specific BookInstance
// exports.bookinstance_detail = function() {
//     res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
// };
// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next){

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      (!req.user)?
        res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
        :
        res.render('./bookcopy/bookinstance_detail.ejs', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance, username: req.user.username
      });
      let dueBk = bookinstance.due_back;
    })

};


exports.bookinstance_detail_post = [

  // Validate fields.
  validator.body('status', 'status must be specified').isLength({ min: 1 }).trim(),

  // validator.body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),

  // validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  
  // // Sanitize fields.
  validator.sanitizeBody('status').escape(),

  // validator.sanitizeBody('imprint').escape(),

  // validator.sanitizeBody('status').trim().escape(),

  // validator.sanitizeBody('due_back').toDate(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    console.log('-- bookinstanceController.js exports.bookinstance_detail_post [,,,,,,,(req,res,next)]');

    // Extract the validation errors from a request.
   const errors = validator.validationResult(req);

    
    // Create a BookInstance object with escaped and trimmed data.
    // var bookinstance = new BookInstance(
    //   { book: req.body.book,
    //     imprint: req.body.imprint,
    //     status: req.body.status,
    //     // loaned_by: req.body.loaned_by,
    //     // reserved_by: req.body.reserved_by,
    //     due_back: req.body.due_back
    //   });
      
    //   bookinstance.book = '5da8a1ff1931e111bc2efff3'
    //  bookinstance.imprint = 'Johnsons, 2022';

    // if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      // Book.find({},'title').exec(function (err, books)
      // {
      //   if (err) { return next(err); }
      //   // Successful, so render.
      //   (!req.user)?
      //     res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
      //     :
      //     res.render('./bookcopy/bookinstance_form.ejs', { title: 'CREATE BOOK INSTANCE FORM', books: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance, username: req.user.username });
      // });
      // return;

      BookInstance.findById(req.params.id)
    .populate('book')
    .exec( function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
      } else {


          if (req.body.status == "makeBookAvailable") {
            // Create a bookinstance object with escaped/trimmed data and old id.
            var updatebookinstance = new BookInstance(
              { status: 'Available',
                book: bookinstance.book.id,
                imprint: bookinstance.imprint,
                due_back: bookinstance.due_back,
                reserved_by: "",
                loaned_by: "",
                _id: req.params.id
              });
          } else if (req.body.status == "makeBookReserved"){
            // Create a bookinstance object with escaped/trimmed data and old id.
            var updatebookinstance = new BookInstance(
              { status: 'Reserved',
                book: bookinstance.book.id,
                imprint: bookinstance.imprint,
                due_back: bookinstance.due_back,
                reserved_by: req.user.username,
                loaned_by: req.user.username,
                _id: req.params.id
              });
          }
        // Data from form is valid. Update the record.
        BookInstance.findByIdAndUpdate(req.params.id, updatebookinstance, {}, function (err,thebookinstance) {
          if (err) { return next(err); }
            // Successful - redirect to bookinstance detail page.
            res.redirect(thebookinstance.url);
          });
      }
    })


    //   // Successful, so render.
    //   (!req.user)?
    //     res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
    //     :
    //     res.render('./bookcopy/bookinstance_detail.ejs', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance, username: req.user.username
    //   });
    //   let dueBk = bookinstance.due_back;
    // })


    // }
    // else {
    //   // Data from form is valid.
    //   bookinstance.save(function (err) {
    //   if (err) { return next(err); }
    //     // Successful - redirect to new record.
    //     res.redirect(bookinstance.url);
    //   });
    // }

    console.log('bookinstanceController.js exports.bookinstance_detail_post [,,,,,,,(req,res,next)]');

  }
];





// Display BookInstance create form on GET
// exports.bookinstance_create_get = function() {
//     res.send('NOT IMPLEMENTED: BookInstance create GET');
// };
// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       
  console.log('-- bookinstanceController.js exports.bookinstance_create_get');

  Book.find({},'title')
  .exec(function (err, books) {
    if (err) { return next(err); }
    // Successful, so render.
    (!req.user)?
			res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
		  :
			res.render('./bookcopy/bookinstance_form.ejs', {title: 'CREATE BOOK INSTANCE FORM', books: books, username: req.user.username});
  });
  
  // async.parallel(
  // {
  //   books: function(callback){
  //     Book.find(callback)
  //   },
	// 	bookinstances: function(callback) {
	// 			BookInstance.find(callback);
	// 	},
	// 	// users: function(callback) {
	// 	// 		User.find(callback);
	// 	// },
	// }, 
	// function(err, results) {
	// 	if (err) { return next(err); }
  //   let authors2 = Array.from(Object.create(results.authors))
		// results.authors.sort(function(a, b) {
		// 	let textA = a.family_name.toUpperCase(); 
		// 	let textB = b.family_name.toUpperCase(); 
		// return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		// });
		
    
  //   (!req.user)?
	// 		res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
	// 	  :
	// 		res.render('./bookcopy/bookinstance_form.ejs', {title: 'CREATE BOOK INSTANCE FORM', books: results.books, bookinstances: results.bookinstances, users: results.users, username: req.user.username});  



  // }
  // );



  console.log('bookinstanceController.js exports.bookinstance_create_get');

};

// Handle BookInstance create on POST
// exports.bookinstance_create_post = function() {
//     res.send('NOT IMPLEMENTED: BookInstance create POST');
// };
// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate fields.
  validator.body('book', 'Book must be specified').isLength({ min: 1 }).trim(),

  validator.body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),

  validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  
  // Sanitize fields.
  validator.sanitizeBody('book').escape(),

  validator.sanitizeBody('imprint').escape(),

  validator.sanitizeBody('status').trim().escape(),

  validator.sanitizeBody('due_back').toDate(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    console.log('-- bookinstanceController.js exports.bookinstance_create_post [,,,,,,,(req,res,next)]');

    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    
    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance(
      { book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        // loaned_by: req.body.loaned_by,
        // reserved_by: req.body.reserved_by,
        due_back: req.body.due_back
      });
      
    //   bookinstance.book = '5da8a1ff1931e111bc2efff3'
    //  bookinstance.imprint = 'Johnsons, 2022';

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({},'title').exec(function (err, books)
      {
        if (err) { return next(err); }
        // Successful, so render.
        (!req.user)?
          res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
          :
          res.render('./bookcopy/bookinstance_form.ejs', { title: 'CREATE BOOK INSTANCE FORM', books: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance, username: req.user.username });
      });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
      if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }

    console.log('bookinstanceController.js exports.bookinstance_create_post [,,,,,,,(req,res,next)]');

  }
];

// Display BookInstance delete form on GET
// exports.bookinstance_delete_get = function() {
//     res.send('NOT IMPLEMENTED: BookInstance delete GET');
// };
// Display bookinstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
	console.log('-- bookinstanceController.js exports.bookinstance_delete_get');

  async.parallel({
		bookinstance: function(callback) {
      BookInstance.findById(req.params.id).exec(callback)
    },
    
		
	  }, 
	  function(err, results) {
      if (err) { return next(err); }
      if (results.bookinstance==null) { // No results.
          res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      (!req.user)?
        res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
        :
        res.render('./bookcopy/bookinstance_delete.ejs', { title: 'DELETE BOOK INSTANCE', bookinstance: results.bookinstance, username: req.user.username } );
    }
  );
  
	console.log('bookinstanceController.js exports.bookinstance_delete_get');

};

// Handle BookInstance delete on POST
// exports.bookinstance_delete_post = function() {
//     res.send('NOT IMPLEMENTED: BookInstance delete POST');
// };
// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
	console.log('-- bookinstanceController.js exports.bookinstance_delete_post');

	async.parallel(
    {
      bookinstance: function(callback) {
        BookInstance.findById(req.body.bookinstanceid).exec(callback)
      },
		}, 
	  function(err, results) {
			if (err) { return next(err); }
			// Success
			// Delete object and redirect to the list of bookinstances.
        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
          if (err) { return next(err); }
          // Success - go to bookinstance list
          res.redirect('/catalog/bookinstances')
        })
		}
  );
  
	console.log('bookinstanceController.js exports.bookinstance_delete_post');

};

// Display BookInstance update form on GET
// exports.bookinstance_update_get = function() {
//     res.send('NOT IMPLEMENTED: BookInstance update GET');
// };
// Display bookinstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) 
{
  console.log('-- bookinstanceController.js exports.bookinstance_update_get');
  
  // Get bookinstance and books for form.
  async.parallel(
    {
      bookinstance: function(callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      },
      books: function(callback) {
        Book.find(callback);
      },
    }, 
 
    function(err, results) {
      if (err) { return next(err); }
      if (results.bookinstance==null) { // No results.
        var err = new Error('bookinstance not found');
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark the selected book as selected.
      for (var i = 0; i < results.books.length; i++) {
          if (results.books[i]._id.toString()==results.bookinstance.book._id.toString()) {

         results.books[i].checked='true';
          }
        }
      
        (!req.user)?
          res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
          :
          res.render('./bookcopy/bookinstance_form.ejs', { title: 'UPDATE BOOK INSTANCE FORM', bookinstance: results.bookinstance, books: results.books, username: req.user.username });
    }
  );
 
};



// Handle bookinstance update on POST
// exports.bookinstance_update_post = function() {
//     res.send('NOT IMPLEMENTED: BookInstance update POST');
// };
// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
 
  // Convert the book to an array
  // (req, res, next) => {
  //     if(!(req.body.book instanceof Array)){
  //         if(typeof req.body.book==='undefined')
  //         req.body.book=[];
  //         else
  //         req.body.book=new Array(req.body.book);
  //     }
  //     next();
  // },
 
  // Validate fields.
  validator.body('status', 'Status must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('book', 'Book must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('imprint', 'Imprint must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('due_back', 'Due back date must not be empty').isLength({ min: 1 }).trim(),
 
  // Sanitize fields.
  validator.sanitizeBody('status').escape(),
  validator.sanitizeBody('book').escape(),
  validator.sanitizeBody('imprint').escape(),
  validator.sanitizeBody('due_back').escape(),
 
 
  // Process request after validation and sanitization.
  (req, res, next) => {
 
      // Extract the validation errors from a request.
      const errors = validator.validationResult(req);
 
      // Create a bookinstance object with escaped/trimmed data and old id.
      var bookinstance = new BookInstance(
        { status: req.body.status,
          book: req.body.book,
          imprint: req.body.imprint,
          due_back: req.body.due_back,
          _id: req.params.id
         });
 
      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.
 
          // Get all authors and genres for form.
          async.parallel({
              books: function(callback) {
                  Book.find(callback);
              },
              }, function(err, results) {
              if (err) { return next(err); }
 
              // Mark our selected book as selected.
              for (let i = 0; i < results.books.length; i++) {
                  if (bookinstance.book.indexOf(results.books[i]._id) > -1) {
                      results.books[i].checked='true';
                  }
              }
              (!req.user)?
                res.render('./user/loginRegisterPage.ejs', {title: 'Login or Register '})
                :
                res.render('./bookcopy/bookinstance_form.ejs', { title: 'UPDATE BOOK INSTANCE FORM', books: books, errors: errors.array(), username: req.user.username });
          });
          return;
      }
      else {
          // Data from form is valid. Update the record.
          BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
              if (err) { return next(err); }
                 // Successful - redirect to bookinstance detail page.
                 res.redirect(thebookinstance.url);
              });
      }
  }
];



console.log('bookinstanceControllerjs');
