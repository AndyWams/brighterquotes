const express = require('express');
const router = express.Router();
//user model
let User = require('../models/user');
//Blog model
let Post = require('../models/posts');

// blog page route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_new_post', {
    title: 'Add New Post'
  });
});

//Add new post route
router.post('/add', function(req, res){
  req.checkBody('title','Title field is required').notEmpty();
//  req.checkBody('author','Author field is required').notEmpty();
  req.checkBody('body','Body field is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_new_post', {
      title: 'Add New Post',
      errors: errors
    });
  }
  else {
    let post = new Post();
    post.title =req.body.title;
    post.author =req.user._id;
    post.body =req.body.body;

    post.save(function(err) {
      if(err){
        console.log(err);
        return;
      }
      else {
        req.flash('success', 'New Post Created');
        res.redirect('/');
      }
    });
  }
})

//Load edit form
router.get('/update_post/:id', ensureAuthenticated, function(req, res){
  Post.findById(req.params.id, function(err, blog){
    if(blog.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('update_post', {
      title: 'Update Post',
      blog: blog
    });
  });
});

//update submit post route
router.post('/update_post/:id', function(req, res){
  let post = {};
  post.title = req.body.title;
  post.author = req.body.author;
  post.body = req.body.body;

  let query ={_id:req.params.id};

  Post.updateOne(query, post, function(err) {
    if(err){
      console.log(err);
      return;
    }
    else {
      req.flash('success', 'Post Updated');
      res.redirect('/');
    }
  });
});

//Deleting Post
router.delete('/:id', function(req, res) {
  if(!req.user._id){
    res.status(500).send();
  }
  let query ={_id:req.params.id}

  Post.findById(req.params.id, function(err, blog){
    if(blog.author != req.user._id){
        res.status(500).send();
    }
    else {
      Post.deleteOne(query, function(err) {
        if(err) {
          console.log(err);
        }
        res.send('success');
      });
    }
  });

});


//Get single blog posts
router.get('/:id', function(req, res){
  Post.findById(req.params.id, function(err, blog){
    User.findById(blog.author, function(err, user){
      res.render('blog', {
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
