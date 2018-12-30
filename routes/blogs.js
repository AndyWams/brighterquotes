const express = require('express');
const router = express.Router();
//user model
let User = require('../models/user');
//Blog model
let Post = require('../models/posts');

//Get single blog posts
router.get('/:id', function(req, res){
  Post.findById(req.params.id, function(err, blog){
    User.findById(blog.author, function(err, user){
      res.render('blogs', {
        blog: blog,
        author: user.name
      });
    });
  });
});



//Access control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please Login to view page');
    res.redirect('/user/login');
  }
}


module.exports = router;
