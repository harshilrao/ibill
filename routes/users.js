const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const path = require('path')
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

//const app = express();

//app.use(express.static(__dirname + './views'));

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

router.get("/css", (req, res) => res.sendFile(path.join(__dirname, "/login.css")));


// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.get("/css1", (req, res) => res.sendFile(path.join(__dirname, "/register.css")));


// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2, profession } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !profession) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      profession
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          profession
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          profession
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
