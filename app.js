const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyPaser = require ('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/database');
const sanitizeHtml = require('sanitize-html');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const async = require('async');
const CONNECTION_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alpinedb';
//connect to mongoDb using mongoose
mongoose.connect(CONNECTION_URI, { useNewUrlParser: true });
//Set db variable
let db = mongoose.connection;

//Check connection
db.once('open', function(){
  console.log('Connected to MondoDB');
});

//check for db erros
db.on('error', function(err){
  console.log(err);
});

//int app
const app = express();

//Bring in Models
let Post = require('./models/posts');
let Kwote = require('./models/kwotes');
let User = require('./models/user');

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
app.use(bodyPaser.urlencoded({extended: false}));

//parse application/json
app.use(bodyPaser.json());

//set public folder for static files
app.use(express.static(path.join(__dirname,'public')));

//Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam +='['+ namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//Passport config
require('./config/passport')(passport);

//passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
 res.locals.user = req.user || null;
 next();
});

let blog = require('./routes/blog');
let user = require('./routes/users');
let quote = require('./routes/quote');
let quotes = require('./routes/quotes');
let blogs = require('./routes/blogs');
app.use('/blog', blog);
app.use('/user', user);
app.use('/quote', quote);
app.use('/quotes', quotes);
app.use('/blogs', blogs);


// home page route: for all Stories and Quotes
app.get('/', function(req, res){
  Post.find({}).sort('-date').exec(function(err, posts){
    Kwote.find({}).sort('-date').exec(function(err, kwotes){
    if(err){
      console.log(err);
    }
    else{
      res.render('index', {
        kwotes: kwotes,
        posts: posts
      });
    }
  });
  })
});

//Route for all blogs post with pagination
app.get('/blogs',ensureAuthenticated, function(req, res, next) {
    var perPage = 5
    var page = req.params.page || 1
    Post.find({}).sort('-date').skip((perPage * page) - perPage).limit(perPage).exec(function(err, posts) {
    Post.countDocuments().exec(function(err, count) {
        if (err) return next(err)
          res.render('blogs', {
              posts: posts,
              current: page,
              pages: Math.ceil(count / perPage)
              })
          })
       })
    
  });

//Route for all pages of each post
app.get('/blogs/pages/:page',ensureAuthenticated, function(req, res, next) {
    var perPage = 5
    var page = req.params.page || 1
    Post.find({}).sort('-date').skip((perPage * page) - perPage).limit(perPage).exec(function(err, posts) {
    Post.countDocuments().exec(function(err, count) {
        if (err) return next(err)
          res.render('pages', {
              posts: posts,
              current: page,
              pages: Math.ceil(count / perPage)
              })
          })
       })
    
  });

//Route for all quotes
app.get('/quotes',ensureAuthenticated, function(req, res){
    Kwote.find({}).sort('-date').exec(function(err, kwotes){
    if(err){
      console.log(err);
    }
    else{
      res.render('quotes', {
        kwotes: kwotes
      });
    }
  });
});

/*app.get('/forgot', function(req, res) {
  res.render('forgot', {
    user: req.user
  });
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

*///Access control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please Login to view page');
    res.redirect('/user/login');
  }
}


//start server
/*app.listen(3000, function(){
  console.log('Server started on port 3000...');
});*/
app.set('port', (process.env.PORT || 3000));
// Listen for set port
app.listen(app.get('port'), (err)=> {
    if(err){
        console.log("Error starting server");
        console.log(err);
        return
    }

    console.log("Server listening on port : "+app.get('port'));
});