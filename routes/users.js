const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in User model
let User = require('../models/user');

// Register form
router.get('/register', function(req, res){
  res.render('register', {
    title: 'Register Now'
  });
});

// Register processing
router.post('/register', function(req, res){
  //store values using body-parser
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords does not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    });
  }
  else {
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash){
       if(err){
         console.log(err);
       }
         newUser.password = hash;
         newUser.save(function(err){
           if(err){
             console.log(err);
             return;
           }
           else {
             req.flash('success', 'You are now registered and can now login');
             res.redirect('/user/login');
           }
         });
       });
     });
   }
});

//Login Form- To redirect to the login form
router.get('/login', function(req, res){
  res.render('login');
});

//Login Process

router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect:'/user/login',
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
   res.redirect('/user/login');
});


module.exports = router;
