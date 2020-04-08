console.log('- userController.js');

var User = require('../models/userModel.js');

// authenticate password
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');

// Function one : setting up the LocalStrategy
passport.use(
  new LocalStrategy((username, password, done) => {
    console.log('username:'+username+', password:'+password);
    User.findOne({ username: username }, (err, user) => {
      console.log('> passport.use');
    
      if (err) { 
        return done(err);
      };
      if (!user) {
        return done(null, false, { msg: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log('<> passwords match!');
          return done(null, user)
        } else {
          // passwords do not match!]
          console.log('<> passwords DO NOT match!')
          return done(null, false, {msg: "Incorrect password"})
        }
      })
 
    });
  })
);

//Functions two and three: Sessions and serialization
passport.serializeUser(function(user, done) {
  console.log('> passport.serializeUser')
  done(null, user.id);
  console.log('<-passport.serializeUser')
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log('> passport.deserializeUser')
    done(err, user);
    console.log('<-passport.deserializeUser')
    
  });
});



// get '/' users home: login/register
exports.loginRegisterPage_get = 
(req,res)=> {
  console.log('- exports.loginRegisterPage_get')
  
  res.render('./user/loginRegisterPage.ejs', {title: 'LOGIN OR REGISTER'})

  console.log('exports.loginRegisterPage_get')
  

}

// get '/login' page
exports.loginPage_get = 
(req, res) => {
  console.log('> exports.loginPage_get login.ejs url /login');

  res.render("./user/login.ejs", {user: req.user});

  console.log('< exports.loginPage_get login.ejs url /login ');

}

// post '/login' page
exports.loginPage_post =
// () => {
//   console.log('- exports.loginPage_post /login ')

  passport.authenticate("local", 
  {
    successRedirect: "/catalog",
    failureRedirect: "/"
  });

//   console.log('exports.loginPage_post /login ')

// }


// get '/register' page
exports.registerPage_get =
(req, res) => {
  console.log('- exports.registerPage_get  ');
  
  res.render("./user/registerPage.ejs");
  
  console.log('exports.registerPage_get ');  
}



// POST '/register' page
exports.registerPage_post =
(req, res) => {
  console.log('> exports.registerPage_post ');

  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    // if err, do something
    if (err){
      return console.log('Err: Password did not encrypt');
    }
    // otherwise, store hashedPassword in DB
    var user = new User({
      username: req.body.username,
      password: hashedPassword
    }).save(err => {
      if (err) { 
        return next(err);
      };
      res.redirect("/");
    });

  });

  console.log('< exports.registerPage_post');
};


exports.logoutPage_get=
(req, res) => {
  console.log('- exports.logoutPage_get');
  
  // logout() set req.user to null
  // res.render('./user/logoutPage.ejs');

  req.logout()
  
  res.redirect('/');
  
  console.log('exports.logoutPage_get');
}




console.log('userController.js');
