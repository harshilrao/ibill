const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const path = require('path')

const app = express();

app.use(express.static(__dirname + './views'));

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
router.get("/css2", (req, res) => res.sendFile(path.join(__dirname, "/home.css")));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;
