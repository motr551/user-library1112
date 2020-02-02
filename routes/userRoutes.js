console.log('- userRoutes.js');

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js')


// get user home page: select login or register
router.get('/', userController.loginRegisterPage_get);

router.get('/login', userController.loginPage_get);

router.post('/login', userController.loginPage_post);

router.get('/register', userController.registerPage_get);

router.post('/register', userController.registerPage_post);

router.get('/logout', userController.logoutPage_get);



module.exports = router;

console.log('userRoutes.js');
