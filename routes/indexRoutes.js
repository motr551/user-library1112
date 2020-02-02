console.log('- index.js');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res ) {
  console.log('-- index.js router.get / > /users');
 
  res.redirect('/users');
  //res.redirect('/catalog');
  console.log('index.js / > /users');
  
});

module.exports = router;

console.log('index.js');
