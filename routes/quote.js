const express = require('express');
const router = express.Router();
//user model
let User = require('../models/user');
//Quote model
let Kwote = require('../models/kwotes');

// quote page route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_new_quote', {
    title: 'Add New Quote'
  });
});


//Add new quote route
router.post('/add', function(req, res){
 /* req.checkBody('username','Username field is required').notEmpty();*/
//  req.checkBody('author','Author field is required').notEmpty();
  req.checkBody('content','Content field is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_new_quote', {
      title: 'Add New Quote',
      errors: errors
    });
  }
  else {
    let kwote = new Kwote();
    kwote.author =req.user._id;
    kwote.content =req.body.content;

    kwote.save(function(err) {
      if(err){
        console.log(err);
        return;
      }
      else {
        req.flash('success', 'New Quote Created');
        res.redirect('/');
      }
    });
  }
})



//Load edit form
router.get('/update_quote/:id', ensureAuthenticated, function(req, res){
  Kwote.findById(req.params.id, function(err, quote){
    if(quote.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('update_quote', {
      title: 'Update Quote',
      quote: quote
    });
  });
});

//update submit quote route
router.post('/update_quote/:id', function(req, res){
  let post = {};
  post.content = req.body.content;
  post.author = req.body.author;

  let query ={_id:req.params.id};

  Kwote.updateOne(query, post, function(err) {
    if(err){
      console.log(err);
      return;
    }
    else {
      req.flash('success', 'Quote Updated');
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

  Kwote.findById(req.params.id, function(err, quote){
    if(quote.author != req.user._id){
        res.status(500).send();
    }
    else {
      Kwote.deleteOne(query, function(err) {
        if(err) {
          console.log(err);
        }
        res.send('success');
      });
    }
  });

});

//Get single Quote posts
router.get('/:id', function(req, res){
  Kwote.findById(req.params.id, function(err, quote){
    User.findById(quote.author, function(err, user){
      res.render('quote', {
        quote: quote,
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
